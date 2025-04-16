const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// a function to store in the local storage
function store(key, value) {
  localStorage.setItem(key, value);
}

// a function to retrieve from the local storage
function retrieve(key) {
  return localStorage.getItem(key);
}

function getRandomArbitrary(min, max) {
  let cached;
  cached = Math.random() * (max - min) + min;
  cached = Math.floor(cached);
  return cached;
}

// a function to clear the local storage
function clear() {
  localStorage.clear();
}

// a function to generate sha256 hash of the given string
async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

async function getSHA256Hash() {
  let cached = retrieve('sha256');
  if (cached) {
    return cached;
  }

  const randomNumber = getRandomArbitrary(MIN, MAX);
  const hash = await sha256(randomNumber.toString());
  store('sha256', hash);
  store('randomNumber', randomNumber);  // Store the random number
  return hash;
}

async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

async function test() {
  const pin = pinInput.value;

  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Please enter exactly 3 digits.';
    resultView.classList.remove('hidden');
    return;
  }

  // Retrieve the stored random number from local storage
  const storedRandomNumber = retrieve('randomNumber');
  if (!storedRandomNumber) {
    resultView.innerHTML = '❌ Failed to retrieve stored number.';
    resultView.classList.remove('hidden');
    return;
  }

  // Hash the entered PIN
  const hashedPin = await sha256(pin);

  // Compare the entered hash with the stored hash
  const storedHash = sha256HashView.innerHTML;

  if (hashedPin === storedHash) {
    resultView.innerHTML = '🎉 Success!';
    resultView.classList.add('success');
  } else {
    resultView.innerHTML = '❌ Incorrect PIN';
  }
  resultView.classList.remove('hidden');
}

// Ensure pinInput only accepts numbers and is 3 digits long
pinInput.addEventListener('input', (e) => {
  const { value } = e.target;
  pinInput.value = value.replace(/\D/g, '').slice(0, 3);
});

// Attach the test function to the button
document.getElementById('check').addEventListener('click', test);

main();
