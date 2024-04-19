<script lang="ts">
  import { classList } from 'svelte-body';
  import { onMount } from 'svelte';
  import AOS from 'aos';
  import Header from '../components/header.svelte';
  import Footer from '../components/footer.svelte';
  // CSS
  import '../app.pcss';
  import 'aos/dist/aos.css';

  onMount(() => {
    AOS.init({
      once: true,
      // disable: "phone",
      disable: window.innerWidth < 768,
      duration: 700,
      easing: 'ease-out-cubic',
    });
  });
</script>

<svelte:body use:classList={'font-inter antialiased bg-white text-gray-900 tracking-tight'} />
<main class="grow">
  <div class="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
    <Header />
    <slot />
  </div>
</main>
<Footer />
