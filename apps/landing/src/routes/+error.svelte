<script lang="ts">
  import { page } from '$app/stores';

  const errorCode: number = $page.status;
  let errorMessage = $page.error?.message;
  if (errorCode === 404) {
    errorMessage = 'This page could not be found.';
  }

  console.error(`Error: ${errorCode}\n> ${$page.error?.message}`);
</script>

<div class="error-wrapper">
  <div>
    <h1 class="error-code">{errorCode}</h1>
    <div style="display: inline-block;">
      <h2 class="error-message">{errorMessage}</h2>
    </div>
  </div>
</div>

<style>
  .error-wrapper {
    height: 100vh;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .error-code {
    border-right: 1px solid rgba(0, 0, 0, 0.3);
    display: inline-block;
    margin: 0px 20px 0px 0px;
    padding: 0px 23px 0px 0px;
    font-size: 24px;
    font-weight: 500;
    vertical-align: top;
    line-height: 49px;
  }
  .error-message {
    font-size: 14px;
    font-weight: 400;
    line-height: 49px;
    margin: 0px;
  }
</style>
