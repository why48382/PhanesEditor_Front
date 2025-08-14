<script setup>
import { ref, onMounted, onBeforeUnmount, createApp, h } from 'vue';
import loader from '@monaco-editor/loader';
import { GoldenLayout } from 'golden-layout';
import fileApi from '@/api/file/file_index'
import 'golden-layout/dist/css/goldenlayout-base.css';
import 'golden-layout/dist/css/themes/goldenlayout-light-theme.css';
import DosChat from "@/components/project/DosChat.vue";

import api from '@/api/file/file_index';

const rootEl = ref(null);

let goldenLayout;                // GoldenLayout 인스턴스
let monaco;            // Monaco 네임스페이스
let sourceEditor;      // 좌측 코드 에디터
let stdinEditor;       // 우측 상단 입력 에디터
let stdoutEditor;      // 우측 하단 출력 에디터

let uploadTimer = null;
let fullText = '';

const datas = {
    fileName: '/JAVA/hello.java',
    fileContents: '',
    projectId: 1,
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

// 파일명 기준으로 Monaco 언어 바꾸기
function setLanguageByFilename(filename) {
    const ext = (filename.split('.').pop() || '').toLowerCase();
    const mode = EXT_TO_MODE[ext] || 'plaintext';
    if (sourceEditor) {
        monaco.editor.setModelLanguage(sourceEditor.getModel(), mode);
    }
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

// ====== 전역 리사이즈 핸들러 (setup 동기 구간에서 등록/해제) ======
const onResize = () => {
    goldenLayout.updateSize();
};

onBeforeUnmount(() => {
    if (uploadTimer) {
        clearInterval(uploadTimer);
        uploadTimer = null;
    }
    window.removeEventListener('resize', onResize);

});

// ====== 마운트 시 초기화 ======
onMounted(async () => {
    // 1) Monaco 로드
    monaco = await loader.init();

    // 2) GoldenLayout v2 초기화
    goldenLayout = new GoldenLayout(rootEl.value);

    // 3) 컴포넌트 등록
    goldenLayout.registerComponentFactoryFunction('source', (container) => {
        const el = document.createElement('div');
        el.style.cssText = 'height:100%;width:100%';
        container.element.appendChild(el);

        sourceEditor = monaco.editor.create(el, {
            value: DEFAULT_SOURCE,
            language: 'java',           // 기본값, 아래에서 파일명 기반으로 조정
            theme: 'vs-dark',
            automaticLayout: true,
            scrollBeyondLastLine: true,
            minimap: { enabled: true },
        });

        // 파일명에 맞춰 언어 설정
        setLanguageByFilename(datas.fileName);
        setFontSizeAll(13);

        // 변경 이벤트
        sourceEditor.onDidChangeModelContent((event) => {
            fullText = sourceEditor.getValue();
            datas.fileContents = fullText;
            // 필요 시 디버그
            // event.changes.forEach(change => {
            //   console.log('입력된 텍스트:', change.text);
            //   console.log('변경 범위:', change.range);
            // });
        });
    });

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

    goldenLayout.registerComponentFactoryFunction('chat', (container, state) => {
        const mountEl = document.createElement('div');
        mountEl.style.cssText = 'height:100%;width:100%';
        container.element.appendChild(mountEl);

        // DosChat은 props 없이도 동작하므로 그대로 마운트
        const app = createApp({ render: () => h(DosChat) });
        app.mount(mountEl);

        // 탭 제목
        container.setTitle(state?.title ?? 'Chat');

        // 정리(탭 닫힐 때 언마운트)
        const observer = new MutationObserver(() => {
            if (!document.body.contains(mountEl)) {
                try { app.unmount(); } catch { }
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });

    goldenLayout.registerComponentFactoryFunction('fileTree', async (container) => {
        const root = document.createElement('div');
        root.className = 'file-tree monaco-editor vs-dark';
        root.style.cssText = 'height:100%;width:100%;overflow:auto;';

        // 상단 검색(옵션)
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

        // 데이터 로드
        const treeData = await fileApi.fetchProjectTree(datas.projectId);

        // 상태
        const state = {
            expanded: new Set(), // 폴더 펼침 상태
            selectedPath: null,
            keyword: '',
        };

        function isMatch(name, keyword) {
            if (!keyword) return true;
            return name.toLowerCase().includes(keyword.toLowerCase());
        }

        function createRow({ depth, icon, name, isFolder, path, node }) {
            const row = document.createElement('div');
            row.className = 'file-tree__row';
            row.style.paddingLeft = `${depth * 14 + 8}px`;

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
                e.stopPropagation();
                if (isFolder) {
                    if (state.expanded.has(node)) state.expanded.delete(node);
                    else state.expanded.add(node);
                    render();
                } else {
                    state.selectedPath = path;
                    render(); // 선택 하이라이트 갱신
                    await openFile(path, name);
                }
            });

            return row;
        }

        function walk(nodes, depth = 0, parentVisible = true) {
            const frag = document.createDocumentFragment();
            for (const node of nodes) {
                const isFolder = node.type === 'folder';
                const name = node.name;
                const path = node.path || name; // 폴더는 path가 없을 수 있음

                // 검색 필터
                if (!isMatch(name, state.keyword)) {
                    // 폴더는 자식 중 매칭이 있으면 보여줘야 함
                    if (isFolder) {
                        const childFrag = walk(node.children || [], depth + 1, false);
                        if (childFrag.childNodes.length > 0) {
                            // 부모도 보여줌
                        } else {
                            continue;
                        }
                    } else {
                        continue;
                    }
                }

                const row = createRow({
                    depth,
                    icon: isFolder ? '📁' : '📄',
                    name,
                    isFolder,
                    path,
                    node,
                });
                frag.appendChild(row);

                if (isFolder && state.expanded.has(node)) {
                    const childFrag = walk(node.children || [], depth + 1, parentVisible);
                    frag.appendChild(childFrag);
                }
            }
            return frag;
        }

        function render() {
            treeWrap.innerHTML = '';
            treeWrap.appendChild(walk(treeData, 0, true));
        }

        // 초기: 루트 폴더들 기본 펼침
        function expandTopLevelFolders(nodes) {
            for (const n of nodes) {
                if (n.type === 'folder') state.expanded.add(n);
            }
        }

        expandTopLevelFolders(treeData);
        render();

        // 검색
        let searchTimer = null;
        search.addEventListener('input', () => {
            if (searchTimer) clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                state.keyword = search.value.trim();
                render();
            }, 150);
        });

        // 탭 제목
        container.setTitle('Project');

        // 메모리 정리(옵션)
        const observer = new MutationObserver(() => {
            if (!document.body.contains(root)) {
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });


    // 4) 레이아웃 로드 (Judge0 느낌)
    goldenLayout.loadLayout({
        root:
        {
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
                                { type: 'component', width: 30, componentType: 'fileTree', title: 'Project', },
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
    if (!uploadTimer) {
        uploadTimer = setInterval(async () => {
            try {
                datas.fileContents = sourceEditor?.getValue() ?? '';
                await api.projectFile(datas);
            } catch (e) {
                // console.error('[auto-save] error:', e);
            }
        }, 30 * 1000);
    }

    // 6) 리사이즈 핸들링
    window.addEventListener('resize', onResize, { passive: true });
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
</style>
