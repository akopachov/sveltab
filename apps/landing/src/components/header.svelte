<script type="ts">
  import { onMount } from 'svelte';
  import Navigation from './navigation.svelte';

  // Reactive state declaration
  let top = true;

  // Scroll handler function
  function scrollHandler() {
    top = window.scrollY <= 10;
  }

  // Lifecycle function to handle side effects
  onMount(() => {
    scrollHandler(); // Call once on mount to set initial state
    window.addEventListener('scroll', scrollHandler);

    // Return a cleanup function to remove the event listener
    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
  });
</script>

<header
  class={`fixed w-full z-30 md:bg-opacity-90 transition duration-300 ease-in-out ${!top ? 'bg-white backdrop-blur-sm shadow-lg' : ''}`}>
  <div class="max-w-6xl mx-auto px-5 sm:px-6">
    <div class="flex items-center justify-between h-16 md:h-20">
      <!-- Site Branding -->
      <div class="shrink-0 mr-4">
        <a href="/" class="block">
          <img class="w-12 h-12" src="./favicon/favicon.svg" alt="SvelTab Logo" />
        </a>
      </div>

      <!-- Desktop Navigation -->
      <nav class="md:flex md:grow">
        <!-- Desktop Sign in Links -->
        <Navigation class="flex grow justify-end flex-wrap items-center" />
      </nav>
    </div>
  </div>
</header>
