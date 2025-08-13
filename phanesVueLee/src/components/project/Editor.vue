<script setup>
import { ref, onMounted, onBeforeUnmount, createApp, h } from 'vue';
import loader from '@monaco-editor/loader';
import { GoldenLayout } from 'golden-layout';
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

    // (선택) AI 패널 placeholder
    goldenLayout.registerComponentFactoryFunction('ai', (container) => {
        const el = document.createElement('div');
        el.style.cssText = 'height:100%;width:100%;display:flex;align-items:center;justify-content:center;color:#888';
        el.textContent = 'AI Assistant (추후 연결)';
        container.element.appendChild(el);
    });

    // 4) 레이아웃 로드 (Judge0 느낌)
    goldenLayout.loadLayout({
        root: {
            type: 'column',
            content: [
                {
                    type: 'row',
                    content: [
                        {
                            type: 'component',
                            componentType: 'source',
                            title: 'Source Code',
                            width: 66,
                        },
                        {
                            type: 'stack',
                            content: [
                                { type: 'component', componentType: 'chat', title: 'Chat', componentState: { title: 'Chat' } },


                            ],
                        },
                    ],
                },
                {
                    type: 'row',
                    content: [
                        { type: 'component', componentType: 'stdin', title: 'Input' },
                        { type: 'component', componentType: 'stdout', title: 'Output' },
                    ],
                },
            ],
        },
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

/* (옵션) minimap 그림자 항상 보이게: Monaco가 hidden 클래스를 줄 때도 그림자 표시 */
.monaco-editor .minimap .minimap-shadow-hidden {
    box-shadow: -6px 0 6px rgba(0, 0, 0, 0.3) !important;
    opacity: 1 !important;
    display: block !important;
}
</style>
