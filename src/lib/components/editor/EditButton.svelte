<script lang="ts">
  import { t } from '$lib/locales/translations';

  export let label = 'common.controls.select';
  export let isLower = true;
  export let icon = '⚙️';
  export let onClick: VoidFunction;

  let text = $t(label);
  if (isLower) text = text.toLowerCase();
</script>

<button type="button" on:click={onClick} title={text}>{icon} {text}</button>

<style lang="scss">
  button {
    border: none;
    color: $text;
    font-size: 1rem;
    text-align: left;

    cursor: pointer;
    padding: 1px 4px;
    background: rgb($secondary, 0.6);
    border-radius: 16px;
    transition: all 0.2s ease-in-out;
    white-space: nowrap;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  button:hover {
    background: rgb($secondary, 0.6);
  }
</style>
