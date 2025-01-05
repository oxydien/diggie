export function setTabIndexRecursively(element, value = 0) {
  if (!element || !element.children) return;

  const focusableElements = ['a', 'button', 'input', 'select', 'textarea'];
  if (focusableElements.includes(element.tagName.toLowerCase()) || element.tabIndex !== -1) {
    element.tabIndex = value;
  }

  for (let i = 0; i < element.children.length; i++) {
    setTabIndexRecursively(element.children[i], value);
  }
}

