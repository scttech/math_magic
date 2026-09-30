import { GLOSSARY_TERMS, getGlossaryEntry, linkifyGlossaryTerms, escapeHtml } from '../../js/app/glossary.js';

QUnit.module('app/glossary', () => {
  QUnit.test('every glossary entry has a unique key, a term, a definition, and at least one match alias', (assert) => {
    const seenKeys = new Set();
    for (const entry of GLOSSARY_TERMS) {
      assert.ok(entry.key && !seenKeys.has(entry.key), `unique key: ${entry.key}`);
      seenKeys.add(entry.key);
      assert.ok(entry.term && entry.term.length > 0, `${entry.key}: has a display term`);
      assert.ok(entry.definition && entry.definition.length > 10, `${entry.key}: has a real definition`);
      assert.ok(Array.isArray(entry.match) && entry.match.length > 0, `${entry.key}: has match aliases`);
    }
  });

  QUnit.test('getGlossaryEntry: returns the matching entry by key, or null for an unknown key', (assert) => {
    assert.equal(getGlossaryEntry('gcf').term, 'GCF');
    assert.equal(getGlossaryEntry('not-a-real-term'), null);
  });

  QUnit.test('linkifyGlossaryTerms: wraps a known term in a button carrying its glossary key', (assert) => {
    const html = linkifyGlossaryTerms('What is the GCF of 12 and 18?');
    assert.ok(html.includes('<button type="button" class="glossary-term" data-glossary-term="gcf">GCF</button>'), html);
  });

  QUnit.test('linkifyGlossaryTerms: matching is case-insensitive but preserves the original casing in the link text', (assert) => {
    const html = linkifyGlossaryTerms('Use the distributive property here.');
    assert.ok(html.includes('data-glossary-term="distributiveProperty">distributive property</button>'), html);
  });

  QUnit.test('linkifyGlossaryTerms: only the first mention of a term is linked; later mentions are left as plain (escaped) text', (assert) => {
    const html = linkifyGlossaryTerms('The mean is 5. Now subtract the mean from each value.');
    const occurrences = html.match(/data-glossary-term="mean"/g) || [];
    assert.equal(occurrences.length, 1, 'only one link for "mean"');
    assert.ok(html.includes('subtract the mean from'), 'the second mention stays as plain text');
  });

  QUnit.test('linkifyGlossaryTerms: a longer phrase is matched whole, not partially matched by a shorter term it contains', (assert) => {
    const html = linkifyGlossaryTerms('Find the mean absolute deviation (MAD) of this data set.');
    assert.ok(html.includes('data-glossary-term="mad">mean absolute deviation</button>'), html);
    assert.notOk(html.includes('data-glossary-term="mean"'), 'the bare "mean" term does not also fire inside the phrase');
    // "MAD" in parentheses is the *second* mention of the same glossary entry, so it stays plain text.
    assert.ok(html.includes('(MAD)'), html);
  });

  QUnit.test('linkifyGlossaryTerms: respects word boundaries, so a term is not matched inside a longer unrelated word', (assert) => {
    const html = linkifyGlossaryTerms('What is the meaning of this expression?');
    assert.notOk(html.includes('glossary-term'), html);
    assert.ok(html.includes('meaning'), html);
  });

  QUnit.test('linkifyGlossaryTerms: escapes HTML-significant characters outside of linked terms', (assert) => {
    const html = linkifyGlossaryTerms('Does x = 5 satisfy the inequality x > 3 & x < 10?');
    assert.ok(html.includes('x &gt; 3'), html);
    assert.ok(html.includes('x &lt; 10'), html);
    assert.ok(html.includes('&amp;'), html);
  });

  QUnit.test('linkifyGlossaryTerms: text with no glossary terms round-trips through escapeHtml unchanged', (assert) => {
    const text = 'What is 12 + 8?';
    assert.equal(linkifyGlossaryTerms(text), escapeHtml(text));
  });

  QUnit.test('escapeHtml: escapes all five HTML-significant characters', (assert) => {
    assert.equal(escapeHtml(`<a href="x">&'</a>`), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
  });
});
