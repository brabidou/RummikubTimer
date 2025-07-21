document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const timerMinutesInput = document.getElementById('timer-minutes');
    const timerSecondsInput = document.getElementById('timer-seconds');
    const applyTimerButton = document.getElementById('apply-timer');
    const pauseButton = document.getElementById('pause-button');
    const alarmSound = document.getElementById('alarm-sound');
    const spacebarSound = document.getElementById('spacebar-sound');
    const soundToggle = document.getElementById('sound-toggle');
    const customSoundInput = document.getElementById('custom-sound');
    const customSpacebarSoundInput = document.getElementById('custom-spacebar-sound');
    
    // Timer variables
    let totalSeconds = 60; // Default: 1 minute in seconds
    let initialSeconds = 60; // Store the initial timer value for resets
    let timerInterval;
    let isPaused = false; // Track if timer is paused
    
    // Function to update the timer display
    function updateTimerDisplay() {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        // Update the display with leading zeros if needed
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    // Function to update the timer duration from input fields
    function updateTimerDuration() {
        const minutes = parseInt(timerMinutesInput.value) || 0;
        const seconds = parseInt(timerSecondsInput.value) || 0;
        
        // Ensure we have at least 1 second
        initialSeconds = Math.max(1, (minutes * 60) + seconds);
        
        // Update the timer
        totalSeconds = initialSeconds;
        updateTimerDisplay();
        
        // Restart the timer with the new duration
        startTimer();
    }
    
    // Function to toggle pause/resume
    function togglePause() {
        isPaused = !isPaused;
        
        if (isPaused) {
            // Pause the timer
            clearInterval(timerInterval);
            timerInterval = null;
            pauseButton.textContent = 'Resume';
            pauseButton.classList.add('resume');
        } else {
            // Resume the timer
            pauseButton.textContent = 'Pause';
            pauseButton.classList.remove('resume');
            
            // Start the countdown again without resetting
            timerInterval = setInterval(() => {
                if (!isPaused) {
                    totalSeconds--;
                    
                    // Update the display
                    updateTimerDisplay();
                    
                    // Check if timer has reached zero
                    if (totalSeconds <= 0) {
                        // Play alarm sound
                        playAlarm();
                        
                        // Auto restart the timer
                        resetTimer();
                    }
                }
            }, 1000);
        }
    }
    
    // Function to start the timer
    function startTimer() {
        // Clear any existing interval
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // Reset to initial time
        totalSeconds = initialSeconds;
        updateTimerDisplay();
        
        // Reset pause state
        isPaused = false;
        pauseButton.textContent = 'Pause';
        pauseButton.classList.remove('resume');
        
        // Start the countdown
        timerInterval = setInterval(() => {
            if (!isPaused) {
                totalSeconds--;
                
                // Update the display
                updateTimerDisplay();
                
                // Check if timer has reached zero
                if (totalSeconds <= 0) {
                    // Play alarm sound
                    playAlarm();
                    
                    // Auto restart the timer
                    resetTimer();
                }
            }
        }, 1000);
    }
    
    // Function to play the alarm sound
    function playAlarm() {
        // Only play if sound is enabled
        if (soundToggle.checked) {
            // Reset the audio to the beginning
            alarmSound.currentTime = 0;
            // Play the sound
            alarmSound.play();
        }
    }
    
    // Function to reset the timer
    function resetTimer() {
        // Reset to initial time and restart
        totalSeconds = initialSeconds;
        updateTimerDisplay();
    }
    
    // Function to play the spacebar sound
    function playSpacebarSound() {
        // Only play if sound is enabled
        if (soundToggle.checked) {
            // Reset the audio to the beginning
            spacebarSound.currentTime = 0;
            // Play the sound
            spacebarSound.play();
        }
    }
    
    // Function to handle timer reset action (used by both spacebar and click)
    function handleResetAction(event) {
        // Prevent default behavior
        event.preventDefault();
        
        // Play sound and reset timer
        playSpacebarSound();
        resetTimer();
    }
    
    // Event listener for spacebar to reset timer
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            handleResetAction(event);
        }
    });
    
    // Event listener for clicks to reset timer
    document.addEventListener('click', (event) => {
        // Ignore clicks on buttons and inputs
        if (event.target.tagName !== 'BUTTON' && 
            event.target.tagName !== 'INPUT' && 
            event.target.tagName !== 'LABEL' &&
            !event.target.closest('.timer-controls') &&
            !event.target.closest('.sound-control')) {
            handleResetAction(event);
        }
    });
    
    // Event listener for Apply button
    applyTimerButton.addEventListener('click', updateTimerDuration);
    
    // Event listener for pause button
    pauseButton.addEventListener('click', togglePause);
    
    // Event listener for custom sound file upload
    customSoundInput.addEventListener('change', (event) => handleCustomSound(event, alarmSound));
    customSpacebarSoundInput.addEventListener('change', (event) => handleCustomSound(event, spacebarSound));
    
    // Function to handle custom sound file upload
    function handleCustomSound(event, audioElement) {
        const file = event.target.files[0];
        if (file) {
            // Check if the file is an audio file
            if (file.type.startsWith('audio/')) {
                // Create a URL for the uploaded file
                const fileURL = URL.createObjectURL(file);
                
                // Update the audio element source
                const sourceElement = audioElement.querySelector('source');
                sourceElement.src = fileURL;
                sourceElement.type = file.type;
                
                // Reload the audio element to apply the new source
                audioElement.load();
                
                // Test play a short snippet of the sound (optional)
                if (soundToggle.checked) {
                    audioElement.currentTime = 0;
                    audioElement.play();
                    // Stop after 1 second for preview
                    setTimeout(() => {
                        audioElement.pause();
                        audioElement.currentTime = 0;
                    }, 1000);
                }
            } else {
                alert('Please select an audio file.');
                event.target.value = '';
            }
        }
    }
    
    // Start the timer when the page loads
    startTimer();
});
