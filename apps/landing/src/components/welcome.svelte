<script lang="ts">
  import Screenshots from '$components/screenshots.svelte';
  import amoImage from '$lib/assets/amo-button.svg';
  import cwoImage from '$lib/assets/cwo-button.svg';
  import edgeImage from '$lib/assets/edge-button.svg';
</script>

<section class="relative">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <!-- Hero content -->
    <div class="pt-32 md:pt-40">
      <!-- Section header -->
      <div class="text-center pb-12 md:pb-16">
        <h1 class="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4" data-aos="zoom-y-out">
          Make your New Tab <span class="inline-grid relative">
            <span
              class="absolute bg-clip-text text-transparent wonderful-text blur-lg pointer-events-none opacity-80 select-none"
              aria-hidden="true">
              wonderful
            </span>
            <span class="bg-clip-text text-transparent wonderful-text">wonderful</span>
          </span>
        </h1>
        <div class="max-w-3xl mx-auto">
          <p class="text-xl text-gray-600" data-aos="zoom-y-out" data-aos-delay="150">
            A beautiful, customizable, privacy-focused New Tab page for Firefox, Chrome, Edge and other Chromium-based
            browsers.
          </p>
          <p class="text-xl text-gray-600 mb-8" data-aos="zoom-y-out" data-aos-delay="150">
            Transform your new tab page into something beautiful and yours.
          </p>
          <div
            class="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center gap-3"
            data-aos="zoom-y-out"
            data-aos-delay="300">
            <a class="btn btn-link p-0 h-fit" href="https://addons.mozilla.org/firefox/addon/sveltab/">
              <img src={amoImage} alt="Addon for FireFox" width="172" height="60" />
            </a>
            <a
              class="btn btn-link p-0 h-fit"
              href="https://chromewebstore.google.com/detail/sveltab/kjfmkbajdehhjlfmldcghgcgmffnohld">
              <img src={cwoImage} alt="Addon for Chrome" width="198" height="60" />
            </a>
            <a
              class="btn btn-link p-0 h-fit"
              href="https://microsoftedge.microsoft.com/addons/detail/gjmmknaifmjpakigdnodcdmpfkkccegj">
              <img src={edgeImage} alt="Addon for Edge" width="172" height="60" />
            </a>
          </div>
          <div class="mt-2">
            or
            <a class="btn btn-link p-0" href="https://demo.sveltab.com/">try web version first</a>
          </div>
        </div>
      </div>

      <Screenshots />
    </div>
  </div>
</section>

<style lang="postcss">
  @keyframes gradientAnimation {
    50% {
      background-position: 100% 50%;
    }
  }

  .wonderful-text {
    background-image: linear-gradient(
      45deg,
      #ff5733,
      #4caf50,
      #3498db,
      #ffc107,
      #e91e63,
      #9c27b0,
      #00bcd4,
      #ff9800,
      #607d8b,
      #8bc34a
    );
    background-size: 200% 200%;

    animation: gradientAnimation 15s linear infinite;
  }
</style>
