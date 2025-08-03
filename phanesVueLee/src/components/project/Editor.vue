<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import loader from '@monaco-editor/loader';
import api from '@/api/file/file_index';

const editorContainer = ref(null);
let editorInstance = null;
let datas = {
    fileName: '',
    fileContents: '',
    projectId: ''
};
let fullText

onMounted(() => {
    loader.init().then(monaco => {
        editorInstance = monaco.editor.create(editorContainer.value, {
            value: '',
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true
        });
        editorInstance.onDidChangeModelContent((event) => {
            fullText = editorInstance.getValue();  // 전체 코드
            console.log('현재 텍스트:', fullText);
            // 뭔가 라이브러리가 덜 받아진것 같은 느낌 아니면 덜 적용 되었거나.
            event.changes.forEach(change => {
                console.log('입력된 텍스트:', change.text);
                console.log('변경 범위:', change.range);
            });
        });
        datas.fileName = "/JAVA/hello.java";
        datas.fileContents = fullText;
        datas.projectId = 1;

        const fileUpload = () => {
            setInterval(async () => {
                await api.projectFile(datas);
                // 전송할 데이터 목록 fullText, 페이지 id, 파일 경로/이름
                // 파일 설정부분을 아직 만들지 않았기 때문에 임의로 하겠음
            }, 1000 * 30)
        }
        fileUpload();

    });
});

onBeforeUnmount(() => {
    if (editorInstance) editorInstance.dispose();
});




</script>

<template>
    <div ref="editorContainer" class="editor-container"></div>
</template>

<style scoped>
.editor-container {
    width: 100%;
    height: 100%;
}
</style>
