// Shared grade/topic picker UI, used by both the Quiz and Worksheet Builder setup forms.
import { listGrades, listTopics } from '../core/registry.js';
import { topicLabel } from './topicLabels.js';

export function populateGradeSelect(selectEl) {
  const grades = listGrades();
  selectEl.innerHTML = grades.map((g) => `<option value="${g}">Grade ${g}</option>`).join('');
}

export function populateTopicCheckboxes(containerEl, grade) {
  const topics = listTopics(grade);
  containerEl.innerHTML = topics
    .map(
      (topic) => `
      <label>
        <input type="checkbox" name="topic" value="${topic}" checked />
        ${topicLabel(topic)}
      </label>`
    )
    .join('');
}

export function getSelectedTopics(containerEl) {
  return Array.from(containerEl.querySelectorAll('input[name="topic"]:checked')).map((el) => el.value);
}

function getTopicCheckboxes(containerEl) {
  return Array.from(containerEl.querySelectorAll('input[name="topic"]'));
}

/** Sets a "Select All" checkbox's checked/indeterminate state to reflect the topic checkboxes' combined state. Call this after populateTopicCheckboxes() rebuilds them, since that resets everything to checked. */
export function syncSelectAllCheckbox(selectAllEl, containerEl) {
  const boxes = getTopicCheckboxes(containerEl);
  const checkedCount = boxes.filter((box) => box.checked).length;
  selectAllEl.checked = boxes.length > 0 && checkedCount === boxes.length;
  selectAllEl.indeterminate = checkedCount > 0 && checkedCount < boxes.length;
}

/** Wires a "Select All" checkbox to a topic-checkbox container: toggling it checks/unchecks every topic, and it stays in sync (including indeterminate, for a partial selection) whenever a topic checkbox changes by itself. */
export function wireSelectAllToggle(selectAllEl, containerEl) {
  selectAllEl.addEventListener('change', () => {
    for (const box of getTopicCheckboxes(containerEl)) box.checked = selectAllEl.checked;
    selectAllEl.indeterminate = false;
    containerEl.dispatchEvent(new Event('change', { bubbles: true }));
  });
  containerEl.addEventListener('change', () => syncSelectAllCheckbox(selectAllEl, containerEl));
}
