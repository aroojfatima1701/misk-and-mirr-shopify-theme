// Misk & Mirr scent quiz: scores each product against the three answers and shows the best match.
class MmScentQuiz extends HTMLElement {
  connectedCallback() {
    this.controller = new AbortController();
    const { signal } = this.controller;
    try {
      this.products = JSON.parse(this.querySelector('script[type="application/json"]').textContent);
    } catch {
      this.products = [];
    }
    this.form = this.querySelector('form');
    this.result = this.querySelector('.mmq__result');
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.show();
    }, { signal });
    this.querySelector('.mmq__again').addEventListener('click', () => {
      this.form.reset();
      this.result.hidden = true;
      this.form.hidden = false;
      this.form.querySelector('input').focus();
    }, { signal });
  }

  disconnectedCallback() {
    this.controller?.abort();
  }

  score(product, answers) {
    const tags = product.tags.map((tag) => tag.toLowerCase());
    const intensity = Number(product.intensity) || 3;
    let score = 0;
    if (tags.includes(`mood:${answers.time}`)) score += 2;
    const bright = ['family:floral', 'family:fruity', 'family:fresh'];
    const warm = ['family:woody', 'family:amber'];
    if ((answers.love === 'bright' ? bright : warm).some((tag) => tags.includes(tag))) score += 3;
    if (answers.strength === 'soft' && intensity <= 3) score += 2;
    if (answers.strength === 'bold' && intensity >= 4) score += 2;
    if (tags.includes('set')) score -= 1;
    return score;
  }

  show() {
    const data = new FormData(this.form);
    const answers = { time: data.get('time'), love: data.get('love'), strength: data.get('strength') };
    if (!this.products.length) return;
    const best = this.products
      .map((product, index) => ({ product, index, score: this.score(product, answers) }))
      .sort((a, b) => b.score - a.score || a.index - b.index)[0].product;
    const img = this.result.querySelector('img');
    img.src = best.image;
    img.alt = best.alt;
    this.result.querySelector('h3').textContent = best.title;
    this.result.querySelector('[data-tagline]').textContent = best.tagline;
    this.result.querySelector('.mmq-price').textContent = best.price;
    this.result.querySelector('a').href = best.url;
    this.form.hidden = true;
    this.result.hidden = false;
    this.result.querySelector('h3').setAttribute('tabindex', '-1');
    this.result.querySelector('h3').focus();
  }
}

if (!customElements.get('mm-scent-quiz')) customElements.define('mm-scent-quiz', MmScentQuiz);
