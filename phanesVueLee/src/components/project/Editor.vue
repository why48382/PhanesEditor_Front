<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, createApp, h } from 'vue';
import { useRoute } from 'vue-router';
import loader from '@monaco-editor/loader';
import { GoldenLayout } from 'golden-layout';
import fileApi from '@/api/file/file_index'
import 'golden-layout/dist/css/goldenlayout-base.css';
import 'golden-layout/dist/css/themes/goldenlayout-light-theme.css';
import DosChat from "@/components/project/DosChat.vue";
import projectApi from '@/api/project/project_index'
import api from '@/api/file/file_index';
import Stomp from 'stompjs';

let isProgrammaticEdit = false;

const route = useRoute();

const projectId = route.params.id;

const rootEl = ref(null);

let filedIdx = "";

let goldenLayout;                // GoldenLayout 인스턴스
let monaco;                      // Monaco 네임스페이스
let sourceEditor;                // 좌측 코드 에디터
let stdinEditor;                 // 우측 상단 입력 에디터
let stdoutEditor;                // 우측 하단 출력 에디터
let sourceContainer;             // source 탭 컨테이너(제목 변경용)

const modelCache = new Map();    // fileId(path/name) → monaco.editor.ITextModel

let uploadTimer = null;
let fullText = '';

const datas = {
    name: '/JAVA/hello.java',
    contents: '',
    idx: 1,
    fileIdx: ''
};

// 확장자 → Monaco 언어 매핑
const EXT_TO_MODE = {
    asm: 'asm',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    java: 'java',
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    php: 'php',
    rb: 'ruby',
    rs: 'rust',
    swift: 'swift',
    r: 'r',
    sql: 'sql',
    sh: 'shell',
    txt: 'plaintext',
};

// 파일명 → 언어
function getLanguageByFilename(name) {
    const ext = (name?.split('.').pop() || '').toLowerCase();
    return EXT_TO_MODE[ext] || 'plaintext';
}

// 폰트 사이즈 한번에 변경
function setFontSizeAll(fontSize = 13) {
    sourceEditor?.updateOptions({ fontSize });
    stdinEditor?.updateOptions({ fontSize });
    stdoutEditor?.updateOptions({ fontSize });
}

// 기본 예시 코드/입력
const DEFAULT_SOURCE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello Judge0-style Layout!");
    }
}
`;
const DEFAULT_STDIN = `3
1 2
2 3
3 4
`;

// ====== 전역 리사이즈 핸들러 ======
const onResize = () => {
    goldenLayout?.updateSize();
};

onBeforeUnmount(() => {
    if (uploadTimer) {
        clearInterval(uploadTimer);
        uploadTimer = null;
    }
    window.removeEventListener('resize', onResize);

    // 🔑 Monaco 모델 정리
    monaco?.editor.getModels().forEach(model => model.dispose());
    modelCache.clear();
});

// 프로젝트 데이터
let fileList = reactive([]);
let memberList = reactive([]);
let chatList = reactive([]);
let userIdx = '';

const fetchProjectFiles = async () => {
    const data = await projectApi.fetchProjectById(route.params.id);
    if (data && data.success) {
        if (data.results) {
            userIdx = data.results.userIdx;
            const projectFileList = data.results.projectFile || [];
            const projectMemberList = data.results.projectMember || [];
            const projectChatList = data.results.projectChat || [];
            if (projectFileList.length) fileList.push(...projectFileList);
            if (projectMemberList.length) memberList.push(...projectMemberList);
            if (projectChatList.length) chatList.push(...projectChatList);
        }
    } else {
        fileList.splice(0);
        memberList.splice(0);
    }
};

// ====== 에디터에 파일 열기(모델 스위칭) ======
function openFileInEditor(file) {
    // file: { idx, name, path, type, contents }
    const fileIdRaw = file.path || file.name || '/untitled';
    const fileId = fileIdRaw.replace(/^\//, ''); // URI path로 쓰기 위해 선행 슬래시 제거
    const lang = getLanguageByFilename(file.name);
    const uri = monaco.Uri.parse(`inmemory:///${encodeURI(fileId)}`);

    datas.fileIdx = file.idx;

    let model = modelCache.get(fileId);
    if (!model) {
        model = monaco.editor.createModel(file.contents ?? '', lang, uri);
        modelCache.set(fileId, model);
    } else {
        // 기존 모델이면 내용/언어 갱신
        model.setValue(file.contents ?? '');
        monaco.editor.setModelLanguage(model, lang);
    }

    // 에디터에 장착
    sourceEditor.setModel(model);

    // 탭 제목 및 내부 상태 갱신
    sourceContainer?.setTitle(file.name || 'Source Code');
    // datas.name = file.path || file.name || '/untitled';
    datas.name = file.name;
    datas.contents = file.contents ?? '';
    fullText = datas.contents;
    setFontSizeAll(13);
}

const code = ref({});
const mouse = ref(null);
const cursor = ref(null);

const socket = ref(null);

const unsubscribe = (fileIdx) => {
    // 구독 취소 함수
    socket.value.unsubscribe("file" + fileIdx);
    // 원래 있었던 방의 번호를 전달해줘야 함.
    // socket.value.disconnect();
}

const subscribe = (fileIdx) => { // 프로젝트 id 등록시키기
    socket.value.subscribe(`/topic/editor/${fileIdx}`, msg => {
        code.value = JSON.parse(msg.body);
        isProgrammaticEdit = true;
        if (code.value.type == "save") {
            sourceEditor.setValue(code.value.text);
        } else if (userIdx != code.value.senderId) {


            sourceEditor.executeEdits("remote-edit", [
                {
                    range: new monaco.Range(
                        code.value.range.startLineNumber,
                        code.value.range.startColumn,
                        code.value.range.endLineNumber,
                        code.value.range.endColumn
                    ),
                    text: code.value.text,
                }
            ]);
        }
        isProgrammaticEdit = false;
    }, { id: "file" + fileIdx });
}
const sendMessage = (mesaage) => {
    socket.value.send(`/app/editor/${filedIdx}`, {}, JSON.stringify(mesaage));
}

const connectWebSocket = () => {
    const ws = new WebSocket("ws://localhost:8080/websocket")
    const client = Stomp.over(ws);
    socket.value = client;

    client.connect({},
        frame => {
        },
        err => { });
}

// ====== 마운트 시 초기화 ======
onMounted(async () => {
    await fetchProjectFiles();

    // 1) Monaco 로드
    monaco = await loader.init();

    // 2) GoldenLayout v2 초기화
    goldenLayout = new GoldenLayout(rootEl.value);

    // 3) 컴포넌트 등록
    // -- Source
    goldenLayout.registerComponentFactoryFunction('source', (container) => {
        sourceContainer = container;

        const el = document.createElement('div');
        el.style.cssText = 'height:100%;width:100%';
        container.element.appendChild(el);

        // 기본 모델 생성 후 장착(값 대신 model 사용)
        const defaultUri = monaco.Uri.parse('inmemory:///Main.java');
        const defaultModel = monaco.editor.createModel(DEFAULT_SOURCE, 'java', defaultUri);
        modelCache.set('Main.java', defaultModel);

        sourceEditor = monaco.editor.create(el, {
            model: defaultModel,
            theme: 'vs-dark',
            automaticLayout: true,
            scrollBeyondLastLine: true,
            minimap: { enabled: true },
        });

        setFontSizeAll(13);

        sourceEditor.onDidChangeModelContent((event) => {
            if (isProgrammaticEdit) return;
            fullText = sourceEditor.getValue();
            datas.contents = fullText;
            event.changes.forEach(change => {
                console.log('입력된 텍스트:', change.text);
                console.log('변경 범위:', change.range);
                code.value = {
                    senderId: userIdx,
                    text: change.text,
                    range: change.range,
                    type: "nomal"
                }
                // code.value
                sendMessage(code.value)
            })
        });
    });

    // -- STDIN
    goldenLayout.registerComponentFactoryFunction('stdin', (container) => {
        const el = document.createElement('div');
        el.style.cssText = 'height:100%;width:100%';
        container.element.appendChild(el);

        stdinEditor = monaco.editor.create(el, {
            value: DEFAULT_STDIN,
            language: 'plaintext',
            theme: 'vs-dark',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
        });
    });

    // -- STDOUT
    goldenLayout.registerComponentFactoryFunction('stdout', (container) => {
        const el = document.createElement('div');
        el.style.cssText = 'height:100%;width:100%';
        container.element.appendChild(el);

        stdoutEditor = monaco.editor.create(el, {
            value: '',
            language: 'plaintext',
            theme: 'vs-dark',
            readOnly: true,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
        });
    });

    // -- Chat
    goldenLayout.registerComponentFactoryFunction('chat', (container, state) => {
        const mountEl = document.createElement('div');
        mountEl.style.cssText = 'height:100%;width:100%';
        container.element.appendChild(mountEl);

        const app = createApp({
            render: () => h(DosChat, { chatList })
        });
        app.mount(mountEl);

        container.setTitle(state?.title ?? 'Chat');

        const observer = new MutationObserver(() => {
            if (!document.body.contains(mountEl)) {
                try { app.unmount(); } catch { }
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });

    // -- 파일 트리
    goldenLayout.registerComponentFactoryFunction('fileTree', async (container) => {
        const root = document.createElement('div');
        root.className = 'file-tree monaco-editor vs-dark';
        root.style.cssText = 'height:100%;width:100%;overflow:auto;';

        // 상단 검색
        const searchWrap = document.createElement('div');
        searchWrap.className = 'file-tree__search';
        const search = document.createElement('input');
        search.type = 'text';
        search.placeholder = '파일 검색...';
        searchWrap.appendChild(search);

        const treeWrap = document.createElement('div');
        treeWrap.className = 'file-tree__wrap';

        root.appendChild(searchWrap);
        root.appendChild(treeWrap);
        container.element.appendChild(root);

        const treeData = fileList;

        const state = {
            expanded: new Set(), // 폴더 펼침 상태
            selectedPath: null,
            keyword: '',
        };

        function isMatch(name, keyword) {
            if (!keyword) return true;
            return name.toLowerCase().includes(keyword.toLowerCase());
        }

        function createRow({ idx, depth, icon, name, isFolder, path, node }) {
            const row = document.createElement('div');
            row.className = 'file-tree__row';
            row.style.paddingLeft = `${depth * 14 + 8}px`;
            row.dataset.fileIdx = idx;

            const chevron = document.createElement('span');
            chevron.className = 'file-tree__chevron';
            chevron.textContent = isFolder ? (state.expanded.has(node) ? '▾' : '▸') : '';

            const ico = document.createElement('span');
            ico.className = 'file-tree__icon';
            ico.textContent = icon;

            const label = document.createElement('span');
            label.className = 'file-tree__label';
            label.textContent = name;

            if (!isFolder && state.selectedPath === path) {
                row.classList.add('is-selected');
            }

            row.appendChild(chevron);
            row.appendChild(ico);
            row.appendChild(label);

            // 클릭 동작
            row.addEventListener('click', async (e) => {
                unsubscribe(filedIdx);
                filedIdx = idx; // 여기서 변수에 저장이 안될건 또 뭐람
                subscribe(filedIdx); // 파일 id 넣어 주면 됨
                e.stopPropagation();
                if (isFolder) {
                    if (state.expanded.has(node)) state.expanded.delete(node);
                    else state.expanded.add(node);
                    render();
                } else {
                    state.selectedPath = path;
                    render();

                    const data = await fileApi.openFile(idx);
                    if (data) {
                        // 예: {idx, name, path, type, contents}
                        openFileInEditor(data.results);
                    }
                }
            });

            return row;
        }

        function walk(nodes, depth = 0) {
            const frag = document.createDocumentFragment();
            for (const node of nodes) {
                const isFolder = node.type === 'DIRECTORY';
                const idx = node.idx;
                const name = node.name;
                const path = node.path || name;

                // 검색 필터
                if (!isMatch(name, state.keyword)) {
                    if (isFolder) {
                        const childFrag = walk(node.children || [], depth + 1);
                        if (childFrag.childNodes.length > 0) {
                            // 부모도 그려야 하므로 그대로 진행
                        } else {
                            continue;
                        }
                    } else {
                        continue;
                    }
                }

                const row = createRow({
                    idx,
                    depth,
                    icon: isFolder ? '📁' : '📄',
                    name,
                    isFolder,
                    path,
                    node,
                });
                frag.appendChild(row);

                if (isFolder && state.expanded.has(node)) {
                    const childFrag = walk(node.children || [], depth + 1);
                    frag.appendChild(childFrag);
                }
            }
            return frag;
        }

        function render() {
            treeWrap.innerHTML = '';
            treeWrap.appendChild(walk(treeData, 0));
        }

        function expandTopLevelFolders(nodes) {
            for (const n of nodes) {
                if (n.type === 'DIRECTORY') state.expanded.add(n);
            }
        }

        expandTopLevelFolders(treeData);
        render();

        let searchTimer = null;
        search.addEventListener('input', () => {
            if (searchTimer) clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                state.keyword = search.value.trim();
                render();
            }, 150);
        });

        container.setTitle('Project');

        const observer = new MutationObserver(() => {
            if (!document.body.contains(root)) {
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });

    // 4) 레이아웃 로드
    goldenLayout.loadLayout({
        root: {
            type: "row",
            content: [
                {
                    type: 'column',
                    width: 70,
                    content: [
                        {
                            type: 'row',
                            height: 70,
                            content: [
                                { type: 'component', width: 30, componentType: 'fileTree', title: 'Project' },
                                { type: 'component', width: 70, componentType: 'source', title: 'Source Code' },
                            ],
                        },
                        {
                            type: 'row',
                            height: 30,
                            content: [
                                { type: 'component', width: 30, componentType: 'stdin', title: 'Input' },
                                { type: 'component', width: 70, componentType: 'stdout', title: 'Output' },
                            ],
                        },
                    ],
                },
                { type: 'component', width: 30, componentType: 'chat', title: 'Chat' },
            ]
        }
    });

    // 5) 30초마다 자동 업로드
    document.addEventListener('keydown', async (event) => {
        if (event.ctrlKey && event.key == 's') {
            event.preventDefault();
            try {
                console.log(datas.name + "파일 이름 테스트");
                datas.contents = sourceEditor?.getValue() ?? '';
                code.value = {
                    senderId: userIdx,
                    text: datas.contents,
                    // range: change.range,
                    type: "save"
                }
                sendMessage(code.value);
                console.log(datas);
                    await api.projectFile(datas);
                } catch (e) {
                    // console.error('[auto-save] error:', e);
                }
            }
    })

    // if (!uploadTimer) {
    //     uploadTimer = setInterval(async () => {
    //         try {
    //             datas.contents = sourceEditor?.getValue() ?? '';
    //             await api.projectFile(datas);
    //         } catch (e) {
    //             // console.error('[auto-save] error:', e);
    //         }
    //     }, 30 * 1000);
    // }

    // 6) 리사이즈 핸들링
    window.addEventListener('resize', onResize, { passive: true });

    // 7) 웹소켓 실행
    connectWebSocket();
});
</script>

<template>
    <nav class="navbar">
        <EdirotFrame />
    </nav>
    <div ref="rootEl" class="gl-root"></div>
</template>

<style scoped>
.gl-root {
    width: 100%;
    height: 100%;
    /* 상위 컨테이너가 높이를 보장하지 않으면 보이지 않을 수 있어요 */
    min-height: 600px;
}

/* GoldenLayout 패널 제목 줄바꿈 방지 */
.lm_title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.monaco-editor .minimap .minimap-shadow-hidden {
    box-shadow: -6px 0 6px rgba(0, 0, 0, 0.3) !important;
    opacity: 1 !important;
    display: block !important;
}

/* 파일 트리 간단 스타일 */
.file-tree__search {
    padding: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.file-tree__search input[type="text"] {
    width: 100%;
    height: 28px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #eee;
    border-radius: 4px;
}

.file-tree__wrap {
    padding: 6px 0;
}

.file-tree__row {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 24px;
    line-height: 24px;
    cursor: pointer;
    user-select: none;
    padding-right: 8px;
}

.file-tree__row:hover {
    background: rgba(255, 255, 255, 0.06);
}

.file-tree__row.is-selected {
    background: rgba(90, 160, 255, 0.22);
}

.file-tree__chevron {
    width: 14px;
    text-align: center;
    opacity: 0.9;
}

.file-tree__icon {
    width: 16px;
    text-align: center;
}

.file-tree__label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
