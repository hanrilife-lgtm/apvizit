const WORKER_URL = 'https://snowy-water-5b76.hanrilife.workers.dev';
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
    
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const avgCheck = document.getElementById('avgCheck');
  const newClients = document.getElementById('newClients');
  const profitResult = document.getElementById('profitResult');
  
  function updateProfit() {
    const check = parseFloat(avgCheck.value) || 0;
    const clients = parseFloat(newClients.value) || 0;
    const profit = check * clients;
    profitResult.textContent = profit.toLocaleString('ru-RU') + ' ₽';
  }
  
  if (avgCheck && newClients) {
    avgCheck.addEventListener('input', updateProfit);
    newClients.addEventListener('input', updateProfit);
    updateProfit();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  
  function updateTimer() {
    const now = new Date();
    const diff = endDate - now;
    
    if (diff <= 0) {
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  }
  
  updateTimer();
  setInterval(updateTimer, 60000);
});

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('leadForm');
  const formCard = document.getElementById('formCard');
  const successDiv = document.getElementById('successMessage');
  
  if (!form || !formCard || !successDiv) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('userName').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const budget = document.getElementById('userBudget').value;
    const confidential = document.getElementById('confidentialityAgree')?.checked || false;
    
    if (!name || !phone || !budget) {
      alert('Пожалуйста, заполните все поля формы.');
      return;
    }
    
    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          phone: phone,
          budget: budget,
          confidential: confidential
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        form.style.display = 'none';
        successDiv.style.display = 'block';
      } else {
        alert('❌ Ошибка отправки. Попробуйте позже.');
        console.error('Server error:', result);
      }
    } catch (error) {
      alert('❌ Ошибка соединения. Проверьте интернет.');
      console.error('Fetch error:', error);
    }
  });
});

function downloadNDA() {
  const documentElement = document.getElementById('ndaDocument');
  if (!documentElement) {
    alert('Документ NDA не найден. Обновите страницу.');
    return;
  }
  
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Пожалуйста, разрешите всплывающие окна.');
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Соглашение о неразглашении (NDA)</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 40px; color: #1a1a2e; line-height: 1.6; }
        h2 { font-size: 1.4rem; text-align: center; }
        h3 { font-size: 1.1rem; margin-top: 20px; }
        .nda-doc-header { text-align: center; border-bottom: 2px solid #1a1a2e; padding-bottom: 16px; margin-bottom: 24px; }
        .nda-doc-meta { display: flex; justify-content: center; gap: 30px; margin-top: 8px; }
        ul { padding-left: 24px; }
        li { margin: 4px 0; }
        .nda-doc-sign { display: flex; gap: 40px; margin: 32px 0 16px; }
        .nda-sign-block { flex: 1; padding: 16px; border: 1px solid #eef3f9; border-radius: 8px; }
        .nda-sign-line { border-bottom: 2px solid #1a1a2e; padding: 8px 0; min-height: 40px; }
        .nda-sign-label { font-size: 0.8rem; color: #6b7a8f; margin-top: 4px; }
        .nda-doc-date { text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      ${documentElement.innerHTML}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
}

function copyNDA() {
  const documentElement = document.getElementById('ndaDocument');
  if (!documentElement) {
    alert('Документ NDA не найден.');
    return;
  }
  
  const text = documentElement.textContent.replace(/\s+/g, ' ').trim();
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => alert('✅ Текст NDA скопирован!'))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    alert('✅ Текст NDA скопирован!');
  } catch (err) {
    alert('❌ Не удалось скопировать текст.');
  }
  document.body.removeChild(textarea);
}
