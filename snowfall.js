function createSnowflakes() {
    const snowflakeContainer = document.createElement('div');
    snowflakeContainer.className = 'snowflake';
    const snowflakeSymbols = ['❄', '❅', '❆'];
    snowflakeContainer.textContent = snowflakeSymbols[Math.floor(Math.random() * snowflakeSymbols.length)];


    // Random horizontal starting position
    snowflakeContainer.style.left = Math.random() * 100 + 'vw';
    // Random animation duration
    snowflakeContainer.style.animationDuration = Math.random() * 3 + 2 + 's';
    // Random font size
    snowflakeContainer.style.fontSize = Math.random() * 10 + 10 + 'px';

    document.body.appendChild(snowflakeContainer);

    // Remove snowflake after animation ends
    snowflakeContainer.addEventListener('animationend', () => {
        snowflakeContainer.remove();
    });
}

// Create snowflakes every 200ms
setInterval(createSnowflakes, 200);
