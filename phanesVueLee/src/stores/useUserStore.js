import { defineStore } from "pinia";
import { reactive } from "vue";
import { ref } from "vue";
import { EncryptStorage } from "encrypt-storage";

const encryptStorage = new EncryptStorage("secret-key-production", { prefix: "@PhanesEditor" });

const useUserStore = defineStore("count", () => {
  // 화면 바인딩용
  const userObj = reactive({
    nickname: "",
    email: "",
    createdAt: "",
    platform: "",
  });

  // 마이페이지 응답 저장 (nickname/nickName, platform/plafForm 둘 다 대응)
  const setMypage = (results) => {
    userObj.nickname = results?.nickName ?? "";
    userObj.email = results?.email ?? "";
    userObj.createdAt = results?.createdAt ?? "";
    userObj.platform = results?.plafForm ?? "";
  };

  // (로그인 세션 저장: 만료 포함) — 기존 로직 유지하되 parse 보강
  const setWithExpiry = (mode, key, results, ttl) => {
    const now = Date.now();
    let item = {};

    if (mode === "LOGIN") {
      item = {
        userIdx: results?.idx,
        userEmail: results?.email,
        userName: results?.nickname ?? results?.nickName ?? "",
      };
    } else if (mode === "LXTS") {
      item = getWithExpiry("store") ?? {};
    }

    item.expiry = now + Number(ttl) + 60_000;
    encryptStorage.setItem(key, JSON.stringify(item)); // stringify 했으면…
  };

  const getWithExpiry = (key) => {
    const itemStr = encryptStorage.getItem(key);
    if (!itemStr) return null;

    let item;
    try {
      item = typeof itemStr === "string" ? JSON.parse(itemStr) : itemStr; // …반드시 parse
    } catch {
      encryptStorage.removeItem(key);
      return null;
    }

    if (!item?.expiry || Date.now() > Number(item.expiry)) {
      encryptStorage.removeItem(key);
      return null;
    }
    return item;
    // (참고) encrypt-storage는 객체를 바로 넣어도 되니까
    // setItem(key, obj) / getItem(key)로 맞추고 stringify/parse를 아예 안 쓰는 방식도 가능.
  };

  const loginCheck = () => getWithExpiry("store") !== null;

  const login = (data) => setWithExpiry("LOGIN", "store", data, 86_400_000);

  const logout = () => {
    // 1) 저장된 토큰/세션 삭제
    encryptStorage.removeItem("store");

    // 2) 유저 정보 초기화
    userObj.nickname = "";
    userObj.email = "";
    userObj.createdAt = "";
    userObj.platform = "";
  };

  // ====================== 검색 조건 관련 ======================
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

  return { userObj, setMypage, loginCheck, login, logout, condition, resetCondition };

});

export default useUserStore;
