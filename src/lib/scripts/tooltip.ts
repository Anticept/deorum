export function tooltip(element: HTMLElement) {
  let root: HTMLDivElement | null;
  let div: HTMLDivElement | null;

  const title = element.getAttribute('title') || '';
  let limit = [0, 0];

  function mouseenter(event: MouseEvent): void {
    root = document.querySelector('.root');
    if (!root) return;

    element.removeAttribute('title');

    div = document.createElement('div');
    div.textContent = title;
    div.role = 'tooltip';
    div.className = 'tooltip';
    mouseMove(event);
    root.appendChild(div);

    const { width, height } = div.getBoundingClientRect();
    const { innerWidth, innerHeight } = window;
    limit = [innerWidth - width, innerHeight - height];
  }

  function mouseMove(event: MouseEvent) {
    if (!div) return;
    div.style.left = `${Math.min(event.pageX + 10, limit[0])}px`;
    div.style.top = `${Math.min(event.pageY + 10, limit[1])}px`;
  }

  function mouseLeave(): void {
    if (div && root) {
      root.removeChild(div);
      root = null;
      div = null;
    }
    element.setAttribute('title', title);
  }

  element.addEventListener('mouseenter', mouseenter);
  element.addEventListener('mouseleave', mouseLeave);
  element.addEventListener('mousemove', mouseMove);

  return {
    destroy(): void {
      mouseLeave();
      element.removeEventListener('mouseenter', mouseenter);
      element.removeEventListener('mouseleave', mouseLeave);
      element.removeEventListener('mousemove', mouseMove);
    }
  };
}
