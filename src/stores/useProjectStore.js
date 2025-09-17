import { defineStore } from "pinia";
import { ref } from "vue";

export const useProjectStore = defineStore("project", () => {
  const searchResults = ref([]);   // 검색 결과 저장
  const totalCount = ref(0);       // 전체 개수(페이지네이션용)

  const setResults = (results, total) => {
    searchResults.value = results;
    totalCount.value = total;
  };

  const resetResults = () => {
    searchResults.value = [];
    totalCount.value = 0;
  };

  const condition = ref({
    name: "",
    email: "",
    language: "",
    page: 0,
    size: 10
  });

  // (검색 조건 초기화)
  const resetCondition = () => {
    condition.value = {
      name: "",
      email: "",
      language: "",
      page: 0,
      size: 10
    };
  };

  return { condition, resetCondition, searchResults, totalCount, setResults, resetResults };
});

export default useProjectStore;
