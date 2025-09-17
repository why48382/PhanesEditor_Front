<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import useUserStore from "@/stores/useUserStore.js";
import userApi from "@/api/user/user_index.js";

const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  try {
    const res = await userApi.userMypage(); // ✅ 쿠키로 유저 정보 가져오기
    if (res) {
      userStore.login(res);
      router.push("/");
    } else {
      throw new Error("No user data");
    }
  } catch (err) {
    console.error("로그인 확인 실패", err);
    router.push("/user/login");
  }
});
</script>
