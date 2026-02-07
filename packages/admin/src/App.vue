<template>
  <div id="app">
    <header>
    <h1>Admin Panel</h1>
      <nav>
        <router-link to="/">Dashboard</router-link> |
        <router-link to="/projects">Projects</router-link> |
        <router-link to="/articles">Articles</router-link> |
        <router-link to="/tutorials">Tutorials</router-link> |
        <router-link to="/skills">Skills</router-link> |
        <router-link to="/experiences">Experiences</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

header {
  background-color: #f2f2f2;
  padding: 20px;
  margin-bottom: 20px;
}

nav {
  padding-top: 10px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>