<script lang="ts">
  import Screenshots from '$components/screenshots.svelte';
</script>

<section class="relative">
  <!-- Illustration behind hero content -->
  <div class="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none -z-1" aria-hidden="true">
    <svg width="1360" height="578" viewBox="0 0 1360 578" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="illustration-01">
          <stop stop-color="#FFF" offset="0%" />
          <stop stop-color="#EAEAEA" offset="77.402%" />
          <stop stop-color="#DFDFDF" offset="100%" />
        </linearGradient>
      </defs>
      <g fill="url(#illustration-01)" fill-rule="evenodd">
        <circle cx="1232" cy="128" r="128" />
        <circle cx="155" cy="443" r="64" />
      </g>
    </svg>
  </div>

  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <!-- Hero content -->
    <div class="pt-32 md:pt-40">
      <!-- Section header -->
      <div class="text-center pb-12 md:pb-16">
        <h1 class="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4" data-aos="zoom-y-out">
          Make your New Tab <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            wonderful
          </span>
        </h1>
        <div class="max-w-3xl mx-auto">
          <p class="text-xl text-gray-600" data-aos="zoom-y-out" data-aos-delay="150">
            A beautiful, customizable New Tab page for Firefox, Chrome, Edge and other Chromium-based browsers.
          </p>
          <p class="text-xl text-gray-600 mb-8" data-aos="zoom-y-out" data-aos-delay="150">
            Transform your new tab page into something beautiful and yours.
          </p>
          <div
            class="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center gap-3"
            data-aos="zoom-y-out"
            data-aos-delay="300">
            <a class="btn btn-link p-0 h-fit" href="https://addons.mozilla.org/firefox/addon/sveltab/">
              <img src="./amo-button.svg" alt="Addon for FireFox" />
            </a>
            <a
              class="btn btn-link p-0 h-fit"
              href="https://chromewebstore.google.com/detail/sveltab/kjfmkbajdehhjlfmldcghgcgmffnohld">
              <img src="./cwo-button.svg" alt="Addon for Chrome" />
            </a>
            <a
              class="btn btn-link p-0 h-fit"
              href="https://microsoftedge.microsoft.com/addons/detail/gjmmknaifmjpakigdnodcdmpfkkccegj">
              <img src="./edge-button.svg" alt="Addon for Edge" />
            </a>
          </div>
          <div class="mt-2">
            or
            <a class="btn btn-link p-0" href="https://sveltab.netlify.app/">try web version first</a>
          </div>
        </div>
      </div>

      <Screenshots />
    </div>
  </div>
</section>
