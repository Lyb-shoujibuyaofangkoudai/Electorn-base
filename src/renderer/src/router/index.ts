import { createMemoryHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("../pages/home.vue"),
    meta: { transition: "slide-left" },
  },
  {
    path: "/search",
    component: () => import("../pages/search/search.vue"),
    meta: { transition: "slide-left" },
  },
  {
    path: "/my",
    component: () => import("../pages/my/my.vue"),
    meta: { transition: "slide-left" },
  },
  {
    path: "/setting",
    component: () => import("../pages/setting/setting.vue"),
    meta: { transition: "slide-left" },
  },
];

const router = createRouter({
  // Memory 模式
  history: createMemoryHistory(),
  routes,
});

router.afterEach((to, from) => {
  const toDepth = to.path.split("/").length;
  const fromDepth = from.path.split("/").length;
  to.meta.transition = toDepth < fromDepth ? "slide-right" : "slide-left";
});

export default router;
