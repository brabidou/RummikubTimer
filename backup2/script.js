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
    const addAlarmSoundButton = document.getElementById('add-alarm-sound');
    const customSpacebarSoundInput = document.getElementById('custom-spacebar-sound');
    
    // Container for alarm sounds
    const alarmSoundsContainer = document.querySelector('.alarm-sounds-container');
    
    // Timer variables
    let totalSeconds = 60; // Default: 1 minute in seconds
    let initialSeconds = 60; // Store the initial timer value for resets
    let timerInterval;
    let isPaused = false; // Track if timer is paused
    
    // Alarm sound variables
    let alarmSounds = []; // Array to store custom alarm sounds
    let alarmNames = []; // Array to store alarm sound names
    let currentAlarmIndex = 0; // Index of the current alarm sound
    
    // Get the alarm name display element
    const alarmNameDisplay = document.getElementById('alarm-name-display');
    
    // Helper function to update alarm name display and document title
    function updateAlarmNameDisplay(name) {
        alarmNameDisplay.textContent = name;
        document.title = name + ' - Timer';
    }
    
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
    
    // Function to add a new alarm sound input
    function addAlarmSoundInput() {
        // Create a new alarm sound item
        const alarmSoundItem = document.createElement('div');
        alarmSoundItem.className = 'alarm-sound-item';
        
        // Create name input
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'alarm-sound-name';
        nameInput.placeholder = 'Alarm name';
        
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.className = 'custom-alarm-sound';
        fileInput.accept = 'audio/*';
        
        // Create remove button
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-sound';
        removeButton.textContent = 'Remove';
        removeButton.disabled = true;
        
        // Add event listener to name input
        nameInput.addEventListener('input', (event) => {
            const index = Array.from(alarmSoundsContainer.children).indexOf(alarmSoundItem);
            if (index !== -1) {
                // Update the name in the array
                alarmNames[index] = event.target.value || 'Unnamed Alarm';
                
                // If this is the current alarm, update the display
                if (index === currentAlarmIndex && alarmSounds[index]) {
                    updateAlarmNameDisplay(alarmNames[index]);
                }
            }
        });
        
        // Add event listener to file input
        fileInput.addEventListener('change', (event) => {
            handleAlarmSoundUpload(event, alarmSoundItem);
            // Enable remove button once a file is selected
            removeButton.disabled = false;
        });
        
        // Add event listener to remove button
        removeButton.addEventListener('click', () => {
            // Get the index of this item
            const index = Array.from(alarmSoundsContainer.children).indexOf(alarmSoundItem);
            
            // Remove the sound and name from the arrays
            if (index !== -1) {
                if (index < alarmSounds.length) {
                    alarmSounds.splice(index, 1);
                }
                if (index < alarmNames.length) {
                    alarmNames.splice(index, 1);
                }
            }
            
            // Remove the item from the DOM
            alarmSoundItem.remove();
            
            // Update current index if needed
            if (alarmSounds.length > 0) {
                currentAlarmIndex = currentAlarmIndex % alarmSounds.length;
                // Update the display with the current alarm name
                if (alarmNames[currentAlarmIndex]) {
                    updateAlarmNameDisplay(alarmNames[currentAlarmIndex]);
                } else {
                    updateAlarmNameDisplay('Timer');
                }
            } else {
                currentAlarmIndex = 0;
                updateAlarmNameDisplay('Timer');
            }
        });
        
        // Append elements to the item
        alarmSoundItem.appendChild(nameInput);
        alarmSoundItem.appendChild(fileInput);
        alarmSoundItem.appendChild(removeButton);
        
        // Insert the new item before the "Add Another Sound" button
        alarmSoundsContainer.insertBefore(alarmSoundItem, addAlarmSoundButton);
    }
    
    // Function to handle alarm sound upload
    function handleAlarmSoundUpload(event, alarmSoundItem) {
        const file = event.target.files[0];
        if (file) {
            // Check if the file is an audio file
            if (file.type.startsWith('audio/')) {
                // Create a URL for the uploaded file
                const fileURL = URL.createObjectURL(file);
                
                // Create an audio element for this sound
                const audio = new Audio(fileURL);
                
                // Get the index of this item
                const index = Array.from(alarmSoundsContainer.children).indexOf(alarmSoundItem);
                
                // Get the name input for this item
                const nameInput = alarmSoundItem.querySelector('.alarm-sound-name');
                let alarmName = 'Unnamed Alarm';
                
                // If name input has a value, use it
                if (nameInput && nameInput.value) {
                    alarmName = nameInput.value;
                } else if (file.name) {
                    // Otherwise use the file name without extension
                    alarmName = file.name.replace(/\.[^/.]+$/, '');
                    // Update the name input with the file name
                    if (nameInput) {
                        nameInput.value = alarmName;
                    }
                }
                
                // Store the audio element and name in the arrays
                if (index !== -1) {
                    // If updating an existing sound
                    if (index < alarmSounds.length) {
                        alarmSounds[index] = audio;
                        alarmNames[index] = alarmName;
                    } else {
                        // If adding a new sound
                        alarmSounds.push(audio);
                        alarmNames.push(alarmName);
                    }
                    
                    // If this is the current alarm, update the display
                    if (index === currentAlarmIndex) {
                        updateAlarmNameDisplay(alarmName);
                    }
                }
                
                // Play a preview
                if (soundToggle.checked) {
                    audio.currentTime = 0;
                    audio.play();
                    // Stop after 1 second
                    setTimeout(() => {
                        audio.pause();
                        audio.currentTime = 0;
                    }, 1000);
                }
            } else {
                alert('Please select an audio file.');
                event.target.value = '';
            }
        }
    }
    
    // Function to play the alarm sound
    function playAlarm() {
        // Only play if sound is enabled and we have alarm sounds
        if (soundToggle.checked && alarmSounds.length > 0) {
            // Get the current alarm sound and name
            const audio = alarmSounds[currentAlarmIndex];
            const name = alarmNames[currentAlarmIndex] || 'Unnamed Alarm';
            
            // Update the alarm name display and document title
            updateAlarmNameDisplay(name);
            
            // Add a highlight effect to the name display
            alarmNameDisplay.style.color = '#e74c3c';
            setTimeout(() => {
                alarmNameDisplay.style.color = '#2c3e50';
            }, 1000);
            
            // Reset to beginning and play
            audio.currentTime = 0;
            audio.play();
            
            // Move to the next alarm sound for next time
            currentAlarmIndex = (currentAlarmIndex + 1) % alarmSounds.length;
        } else if (soundToggle.checked) {
            // Fallback to default alarm if no custom sounds
            alarmSound.currentTime = 0;
            alarmSound.play();
            updateAlarmNameDisplay('Default Alarm');
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
        
        // Advance to the next alarm sound if we have multiple alarms
        if (alarmSounds.length > 0) {
            // Move to the next alarm sound
            currentAlarmIndex = (currentAlarmIndex + 1) % alarmSounds.length;
            
            // Update the alarm name display and document title
            if (alarmNames[currentAlarmIndex]) {
                updateAlarmNameDisplay(alarmNames[currentAlarmIndex]);
            } else {
                updateAlarmNameDisplay('Unnamed Alarm');
            }
        } else {
            // If no custom alarms, set to default
            updateAlarmNameDisplay('Timer');
        }
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
    
    // Event listener for custom spacebar sound file upload
    customSpacebarSoundInput.addEventListener('change', (event) => handleCustomSound(event, spacebarSound));
    
    // Event listener for add alarm sound button
    addAlarmSoundButton.addEventListener('click', addAlarmSoundInput);
    
    // Initialize the first alarm sound input
    const firstAlarmInput = document.querySelector('.custom-alarm-sound');
    const firstNameInput = document.querySelector('.alarm-sound-name');
    
    if (firstAlarmInput) {
        // Add event listener for file input
        firstAlarmInput.addEventListener('change', (event) => {
            const alarmSoundItem = event.target.closest('.alarm-sound-item');
            handleAlarmSoundUpload(event, alarmSoundItem);
            // Enable the remove button
            const removeButton = alarmSoundItem.querySelector('.remove-sound');
            if (removeButton) {
                removeButton.disabled = false;
            }
        });
    }
    
    if (firstNameInput) {
        // Add event listener for name input
        firstNameInput.addEventListener('input', (event) => {
            const alarmSoundItem = event.target.closest('.alarm-sound-item');
            const index = Array.from(alarmSoundsContainer.children).indexOf(alarmSoundItem);
            
            if (index !== -1) {
                // Update the name in the array
                alarmNames[index] = event.target.value || 'Unnamed Alarm';
                
                // If this is the current alarm, update the display
                if (index === currentAlarmIndex && alarmSounds[index]) {
                    updateAlarmNameDisplay(alarmNames[index]);
                }
            }
        });
    }
    
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
    
    // Initialize document title
    document.title = 'Adjustable Timer';
    
    // Start the timer when the page loads
    startTimer();
});
