const fs = require('fs');
const p = 'dist/blog/index.html';
let html = fs.readFileSync(p, 'utf8');

const i = html.lastIndexOf('<script>');
if (i > -1) {
    const newScript = `<script>
        document.addEventListener('DOMContentLoaded', () => {
            const searchInput = document.getElementById('searchInput');
            const chips = document.querySelectorAll('.chip');
            const cards = document.querySelectorAll('.blog-card');
            const noResults = document.getElementById('noResults');

            function filterBlog() {
                const searchTerm = searchInput.value.toLowerCase();
                const activeCategory = document.querySelector('.chip.active').dataset.filter;
                let matchCount = 0;

                cards.forEach(card => {
                    const title = card.querySelector('h2').textContent.toLowerCase();
                    const category = card.dataset.category;

                    const matchesSearch = title.includes(searchTerm);
                    const matchesCategory = activeCategory === 'all' || category === activeCategory;

                    if (matchesSearch && matchesCategory) {
                        if (searchTerm === '' && activeCategory === 'all' && matchCount >= 5) {
                            card.style.display = 'none';
                        } else {
                            card.style.display = 'block';
                        }
                        matchCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });

                noResults.style.display = matchCount === 0 ? 'block' : 'none';
            }
            
            filterBlog();

            searchInput.addEventListener('input', filterBlog);

            chips.forEach(chip => {
                chip.addEventListener('click', () => {
                    chips.forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    filterBlog();
                });
            });
        });
    </script>
</body>
</html>`;
    html = html.substring(0, i) + newScript;
    fs.writeFileSync(p, html, 'utf8');
    console.log('Fixed script successfully');
} else {
    console.log('Script tag not found');
}
