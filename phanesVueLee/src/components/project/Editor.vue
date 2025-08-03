<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import loader from '@monaco-editor/loader';

const editorContainer = ref(null);
let editorInstance = null;

onMounted(() => {
    loader.init().then(monaco => {
        editorInstance = monaco.editor.create(editorContainer.value, {
            value: '',
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true
        });
        editorInstance.onDidChangeModelContent((event) => {
                const fullText = editorInstance.getValue();  // 전체 코드
                console.log('현재 텍스트:', fullText);
                // 뭔가 라이브러리가 덜 받아진것 같은 느낌 아니면 덜 적용 되었거나.
                event.changes.forEach(change => {
                    console.log('입력된 텍스트:', change.text);
                    console.log('변경 범위:', change.range);
                });
            });
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
