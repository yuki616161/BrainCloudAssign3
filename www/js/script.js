function validateForm() {
    const lastTimeInput = document.getElementById('lastTime');
    lastTimeInput.value = new Date().toISOString().slice(0, 16);
    return true;
}