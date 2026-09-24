const loanState = {
  amount: Number(localStorage.getItem('mayaLoanAmount')) || 100000,
  months: Number(localStorage.getItem('mayaLoanMonths')) || 24,
  rate: 0.04
};

function peso(value) {
  return `P${Math.round(value).toLocaleString('en-PH')}`;
}

function calculateLoan() {
  const interest = loanState.amount * loanState.rate * (loanState.months / 12);
  const total = loanState.amount + interest;
  return { interest, total, monthly: total / loanState.months };
}

function renderLoan() {
  const amountInput = document.querySelector('#loanAmount');
  if (!amountInput) return;
  loanState.amount = Number(amountInput.value);
  const amountLabel = document.querySelector('#amountLabel');
  const termLabel = document.querySelector('#termLabel');
  const result = calculateLoan();
  amountLabel.textContent = peso(loanState.amount);
  termLabel.textContent = `${loanState.months} months`;
  document.querySelector('#monthlyPayment').textContent = `${peso(result.monthly)} / mo`;
  document.querySelector('#interestValue').textContent = peso(result.interest);
  document.querySelector('#totalValue').textContent = peso(result.total);
}

function initApplication() {
  const amountInput = document.querySelector('#loanAmount');
  if (!amountInput) return;
  amountInput.value = loanState.amount;
  document.querySelectorAll('.term-option').forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.months) === loanState.months);
    button.addEventListener('click', () => {
      loanState.months = Number(button.dataset.months);
      document.querySelectorAll('.term-option').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      renderLoan();
    });
  });
  amountInput.addEventListener('input', renderLoan);
  document.querySelector('#continueButton').addEventListener('click', () => {
    localStorage.setItem('mayaLoanAmount', loanState.amount);
    localStorage.setItem('mayaLoanMonths', loanState.months);
    window.location.href = 'details.html';
  });
  renderLoan();
}

function initDetails() {
  const form = document.querySelector('#detailsForm');
  if (!form) return;
  const phone = document.querySelector('#detailsPhone');
  const savedPhone = localStorage.getItem('mayaPhone');
  if (savedPhone) phone.value = savedPhone;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    localStorage.setItem('mayaName', document.querySelector('#fullName').value.trim());
    localStorage.setItem('mayaPhone', phone.value.trim());
    localStorage.setItem('mayaIncome', document.querySelector('#monthlyIncome').value);
    localStorage.setItem('mayaLoanPurpose', document.querySelector('#loanPurpose').value);
    window.location.href = 'login.html';
  });
}

function initLogin() {
  const form = document.querySelector('#loginForm');
  if (!form) return;
  const phone = document.querySelector('#loginPhone');
  phone.value = localStorage.getItem('mayaPhone') || '';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    localStorage.setItem('mayaPhone', phone.value.trim());
    window.location.href = 'otp.html';
  });
}

function initOtp() {
  const form = document.querySelector('#otpForm');
  if (!form) return;
  const fields = [...form.querySelectorAll('.otp-boxes input')];
  const error = document.querySelector('#otpError');

  fields.forEach((field, index) => {
    field.addEventListener('input', () => {
      field.value = field.value.replace(/\D/g, '').slice(-1);
      error.hidden = true;
      if (field.value && fields[index + 1]) fields[index + 1].focus();
    });
    field.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !field.value && fields[index - 1]) fields[index - 1].focus();
    });
    field.addEventListener('paste', (event) => {
      const code = (event.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, fields.length);
      if (!code) return;
      event.preventDefault();
      code.split('').forEach((digit, digitIndex) => { fields[digitIndex].value = digit; });
      fields[Math.min(code.length, fields.length) - 1].focus();
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const code = fields.map((field) => field.value).join('');
    if (code.length !== fields.length) {
      error.hidden = false;
      fields.find((field) => !field.value)?.focus();
      return;
    }
    window.location.href = 'success.html';
  });

  document.querySelector('#resendOtp')?.addEventListener('click', () => {
    fields.forEach((field) => { field.value = ''; });
    error.hidden = true;
    fields[0].focus();
  });
}

function initSuccess() {
  const amount = Number(localStorage.getItem('mayaLoanAmount')) || loanState.amount;
  const months = Number(localStorage.getItem('mayaLoanMonths')) || loanState.months;
  loanState.amount = amount;
  loanState.months = months;
  const result = calculateLoan();
  const amountElement = document.querySelector('#successAmount');
  if (!amountElement) return;
  amountElement.textContent = peso(amount);
  document.querySelector('#successMonthly').textContent = `${peso(result.monthly)} / mo`;
  document.querySelector('#successTerm').textContent = `${months} months`;
}

initApplication();
initDetails();
initLogin();
initOtp();
initSuccess();
