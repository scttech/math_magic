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
