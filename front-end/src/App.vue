<template>
  <router-view />
</template>

<script>
export default {
  name: 'App',
  watch: {
    '$route'(to) {
      this.updatePageTitle(to);
    }
  },
  mounted() {
    this.updatePageTitle(this.$route);
  },
  methods: {
    updatePageTitle(route) {
      document.title = route.meta.title || 'Finance manager';
    }
  }
};
</script>