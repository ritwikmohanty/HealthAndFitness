/**
 * Challenges page script
 * Handles fitness challenges, friends, and events
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load challenges data
    loadChallengesData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Display friends list
    displayFriendsList();
    
    // Display friend leaderboard
    displayFriendLeaderboard();
    
    // Display community challenges
    displayCommunityChallenges();
    
    // Display top performers
    displayTopPerformers('steps');
    
    // Display events feed
    displayEventsFeed();
});

/**
 * Loads and displays challenges data
 */
function loadChallengesData() {
    // Load user profile
    const userProfile = DataStore.getUserProfile();
    
    // Update points
    document.getElementById('totalPoints').textContent = formatNumber(userProfile.points);
    
    // Calculate points to next reward
    const currentPoints = userProfile.points;
    const milestones = [100, 250, 500, 1000, 2000, 5000, 10000];
    
    let nextMilestone = milestones.find(m => m > currentPoints) || (currentPoints + 1000);
    const pointsToNext = nextMilestone - currentPoints;
    
    document.getElementById('pointsToNext').textContent = formatNumber(pointsToNext);
    
    // Update progress bar
    const progressPercentage = Math.min(Math.round((currentPoints / nextMilestone) * 100), 100);
    document.getElementById('pointsProgressBar').style.width = `${progressPercentage}%`;
    document.getElementById('pointsProgressBar').setAttribute('aria-valuenow', progressPercentage);
    
    // Display badges
    displayBadges();
    
    // Display active challenges
    displayActiveChallenges();
}

/**
 * Displays user badges (from achievements)
 */
function displayBadges() {
    const badgesContainer = document.getElementById('recentBadges');
    const noBadgesMessage = document.getElementById('noBadgesMessage');
    const userProfile = DataStore.getUserProfile();
    const achievements = userProfile.achievements || [];
    
    // Check if there are any achievements
    if (achievements.length === 0) {
        noBadgesMessage.style.display = 'block';
        return;
    }
    
    // Hide the no badges message
    noBadgesMessage.style.display = 'none';
    
    // Create badges container
    const badgesList = document.createElement('div');
    badgesList.className = 'badge-container';
    
    // Display the most recent 3 achievements as badges
    const recentAchievements = achievements.slice(-4).reverse();
    recentAchievements.forEach(achievement => {
        const badgeElement = document.createElement('div');
        badgeElement.className = 'badge-item';
        badgeElement.dataset.bsToggle = 'tooltip';
        badgeElement.dataset.bsPlacement = 'top';
        badgeElement.title = `${achievement.title} - ${achievement.description}`;
        badgeElement.innerHTML = `<i class="fas fa-${achievement.icon}"></i>`;
        badgesList.appendChild(badgeElement);
    });
    
    badgesContainer.innerHTML = '';
    badgesContainer.appendChild(badgesList);
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Displays active challenges
 */
function displayActiveChallenges() {
    const challengesContainer = document.getElementById('activeChallengesList');
    const noChallengesMessage = document.getElementById('noChallengesMessage');
    
    try {
        // Get active challenges
        const activeChallenges = DataStore.getActiveUserChallenges();
        
        // Check if there are any active challenges
        if (!activeChallenges || activeChallenges.length === 0) {
            if (noChallengesMessage) {
                noChallengesMessage.style.display = 'block';
            }
            if (challengesContainer) {
                challengesContainer.innerHTML = '';
            }
            return;
        }
        
        // Hide the no challenges message
        if (noChallengesMessage) {
            noChallengesMessage.style.display = 'none';
        }
        
        // Clear existing challenges
        if (challengesContainer) {
            challengesContainer.innerHTML = '';
        } else {
            console.error('Challenge container element not found');
            return;
        }
        
        // Display challenges
        activeChallenges.forEach(challenge => {
        // Calculate progress based on challenge type
        let currentValue = 0;
        let progressPercentage = 0;
        let unitLabel = '';
        
        if (challenge.challengeType === 'steps') {
            // Sum steps between start and end date
            currentValue = sumStepsBetweenDates(challenge.startDate, challenge.endDate);
            unitLabel = 'steps';
        } else if (challenge.challengeType === 'calories') {
            // Sum calories burned between start and end date
            currentValue = sumCaloriesBurnedBetweenDates(challenge.startDate, challenge.endDate);
            unitLabel = 'cal burned';
        } else if (challenge.challengeType === 'workouts') {
            // Count workouts between start and end date
            currentValue = countWorkoutsBetweenDates(challenge.startDate, challenge.endDate);
            unitLabel = 'workouts';
        } else if (challenge.challengeType === 'minutes') {
            // Sum workout minutes between start and end date
            currentValue = sumWorkoutMinutesBetweenDates(challenge.startDate, challenge.endDate);
            unitLabel = 'minutes';
        }
        
        progressPercentage = Math.min(Math.round((currentValue / challenge.goal) * 100), 100);
        
        const challengeElement = document.createElement('div');
        challengeElement.className = `challenge-card p-3 mb-3 ${challenge.challengeType}`;
        challengeElement.innerHTML = `
            <div class="d-flex justify-content-between mb-2">
                <h5 class="mb-0">${challenge.name}</h5>
                <span class="badge bg-secondary">${capitalizeFirstLetter(challenge.challengeType)}</span>
            </div>
            <p class="text-muted small mb-2">${challenge.description || 'Challenge yourself!'}</p>
            <div class="d-flex justify-content-between small mb-1">
                <span>Progress</span>
                <span>${formatNumber(currentValue)}/${formatNumber(challenge.goal)} ${unitLabel}</span>
            </div>
            <div class="progress mb-3" style="height: 8px;">
                <div class="progress-bar bg-primary" role="progressbar" style="width: ${progressPercentage}%;" 
                    aria-valuenow="${progressPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="small text-muted d-flex justify-content-between">
                <span>
                    <i class="fas fa-calendar-alt me-1"></i>
                    ${formatDate(challenge.startDate)} - ${formatDate(challenge.endDate)}
                </span>
                <span>
                    <i class="fas fa-users me-1"></i>
                    ${challenge.participants ? challenge.participants.length : 1} participants
                </span>
            </div>
        `;
        
        challengesContainer.appendChild(challengeElement);
    });
    } catch (error) {
        console.error('Error displaying active challenges:', error);
        if (noChallengesMessage) {
            noChallengesMessage.style.display = 'block';
        }
        if (challengesContainer) {
            challengesContainer.innerHTML = '';
        }
    }
}

/**
 * Sets up event listeners for challenges page
 */
function setupEventListeners() {
    // Create challenge button
    document.getElementById('createChallengeBtn').addEventListener('click', function() {
        const createChallengeModal = new bootstrap.Modal(document.getElementById('createChallengeModal'));
        
        // Set default dates
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        document.getElementById('challengeStart').value = today.toISOString().split('T')[0];
        document.getElementById('challengeEnd').value = nextWeek.toISOString().split('T')[0];
        
        // Update goal placeholder based on selected type
        document.getElementById('challengeType').addEventListener('change', updateGoalPlaceholder);
        updateGoalPlaceholder(); // Initial update
        
        createChallengeModal.show();
    });
    
    // Save challenge button
    document.getElementById('saveChallengeBtn').addEventListener('click', function() {
        const name = document.getElementById('challengeName').value;
        const description = document.getElementById('challengeDescription').value;
        const challengeType = document.getElementById('challengeType').value;
        const goal = parseInt(document.getElementById('challengeGoal').value);
        const startDate = document.getElementById('challengeStart').value;
        const endDate = document.getElementById('challengeEnd').value;
        const visibility = document.querySelector('input[name="challengeVisibility"]:checked').value;
        
        if (!name || isNaN(goal) || goal <= 0 || !startDate || !endDate) {
            alert('Please fill in all required fields with valid values.');
            return;
        }
        
        if (new Date(endDate) <= new Date(startDate)) {
            alert('End date must be after start date.');
            return;
        }
        
        const challenge = {
            id: generateId(),
            name: name,
            description: description,
            challengeType: challengeType,
            goal: goal,
            startDate: startDate,
            endDate: endDate,
            visibility: visibility,
            participants: ['user'],
            createdAt: getCurrentDateString()
        };
        
        DataStore.saveChallenge(challenge);
        
        // Close modal
        const createChallengeModal = bootstrap.Modal.getInstance(document.getElementById('createChallengeModal'));
        createChallengeModal.hide();
        
        // Reload challenges data
        displayActiveChallenges();
        displayCommunityChallenges();
        
        // Show feedback
        showToast('Challenge created successfully!', 'success');
    });
    
    // Challenge type filter
    document.getElementById('challengeTypeFilter').addEventListener('change', function() {
        const filterType = this.value;
        displayCommunityChallenges(filterType);
    });
    
    // Top performer category
    document.getElementById('topPerformerCategory').addEventListener('change', function() {
        const category = this.value;
        displayTopPerformers(category);
    });
    
    // Location filter for events
    document.getElementById('locationFilter').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        displayEventsFeed(searchTerm);
    });
    
    // Add friend button
    document.getElementById('addFriendBtn').addEventListener('click', function() {
        const friendName = document.getElementById('challengeFriend').value.trim();
        if (!friendName) return;
        
        if (DataStore.addFriend(friendName)) {
            document.getElementById('challengeFriend').value = '';
            displayFriendsList();
            displayFriendLeaderboard();
            showToast(`${friendName} added to your friends!`, 'success');
        } else {
            showToast('This friend is already in your list', 'warning');
        }
    });
}

/**
 * Updates goal input placeholder based on challenge type
 */
function updateGoalPlaceholder() {
    const challengeType = document.getElementById('challengeType').value;
    const goalInput = document.getElementById('challengeGoal');
    
    switch (challengeType) {
        case 'steps':
            goalInput.placeholder = 'e.g., 50000';
            break;
        case 'calories':
            goalInput.placeholder = 'e.g., 5000';
            break;
        case 'workouts':
            goalInput.placeholder = 'e.g., 12';
            break;
        case 'minutes':
            goalInput.placeholder = 'e.g., 300';
            break;
    }
}

/**
 * Displays the friends list
 */
function displayFriendsList() {
    const friendsContainer = document.getElementById('friendsList');
    const noFriendsMessage = document.getElementById('noFriendsMessage');
    const friends = DataStore.getFriends();
    
    // Check if there are any friends
    if (friends.length === 0) {
        noFriendsMessage.style.display = 'block';
        return;
    }
    
    // Hide the no friends message
    noFriendsMessage.style.display = 'none';
    
    // Clear existing friends
    friendsContainer.innerHTML = '';
    
    // Display friends
    friends.forEach(friend => {
        const friendElement = document.createElement('div');
        friendElement.className = 'friend-item d-flex justify-content-between align-items-center p-2 border-bottom';
        friendElement.innerHTML = `
            <div>
                <span>${friend.name}</span>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-primary challenge-friend-btn" data-friend-id="${friend.id}">
                    Challenge
                </button>
            </div>
        `;
        friendsContainer.appendChild(friendElement);
    });
    
    // Add event listeners to challenge buttons
    document.querySelectorAll('.challenge-friend-btn').forEach(button => {
        button.addEventListener('click', function() {
            const friendId = this.dataset.friendId;
            const friend = friends.find(f => f.id === friendId);
            if (!friend) return;
            
            // Pre-fill challenge form
            document.getElementById('challengeName').value = `Challenge with ${friend.name}`;
            document.getElementById('challengeDescription').value = `Compete with ${friend.name} to see who can reach the goal first!`;
            document.getElementById('challengeType').value = 'steps';
            document.getElementById('challengeGoal').value = '50000';
            
            // Set default dates
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            
            document.getElementById('challengeStart').value = today.toISOString().split('T')[0];
            document.getElementById('challengeEnd').value = nextWeek.toISOString().split('T')[0];
            
            // Select friends only visibility
            document.getElementById('visibilityFriends').checked = true;
            
            // Show create challenge modal
            const createChallengeModal = new bootstrap.Modal(document.getElementById('createChallengeModal'));
            createChallengeModal.show();
        });
    });
}

/**
 * Displays the friend leaderboard
 */
function displayFriendLeaderboard() {
    const leaderboardContainer = document.getElementById('friendLeaderboard');
    const noLeaderboardMessage = document.getElementById('noLeaderboardMessage');
    const friends = DataStore.getFriends();
    
    // Check if there are any friends
    if (friends.length === 0) {
        noLeaderboardMessage.style.display = 'block';
        return;
    }
    
    // Hide the no leaderboard message
    noLeaderboardMessage.style.display = 'none';
    
    // Clear existing leaderboard
    leaderboardContainer.innerHTML = '';
    
    // Add user to leaderboard
    const leaderboardData = [
        {
            name: 'You',
            steps: DataStore.getDailySteps(),
            calories: DataStore.getTotalCaloriesBurned(),
            workouts: DataStore.getWeeklyWorkouts().length
        }
    ];
    
    // Add friends to leaderboard
    friends.forEach(friend => {
        leaderboardData.push({
            name: friend.name,
            steps: friend.stats.steps,
            calories: friend.stats.calories,
            workouts: friend.stats.workouts
        });
    });
    
    // Sort by steps (highest first)
    leaderboardData.sort((a, b) => b.steps - a.steps);
    
    // Create leaderboard
    const leaderboardElement = document.createElement('div');
    leaderboardElement.className = 'list-group';
    
    leaderboardData.forEach((person, index) => {
        const isUser = person.name === 'You';
        const itemElement = document.createElement('div');
        itemElement.className = `list-group-item d-flex justify-content-between align-items-center ${isUser ? 'bg-dark' : ''}`;
        itemElement.innerHTML = `
            <div>
                <span class="me-2">#${index + 1}</span>
                <span class="${isUser ? 'fw-bold' : ''}">${person.name}</span>
            </div>
            <div>
                <span class="badge bg-primary rounded-pill">${formatNumber(person.steps)} steps</span>
            </div>
        `;
        leaderboardElement.appendChild(itemElement);
    });
    
    leaderboardContainer.appendChild(leaderboardElement);
}

/**
 * Displays community challenges
 * @param {string} filterType - Optional filter for challenge type
 */
function displayCommunityChallenges(filterType = 'all') {
    const challengesContainer = document.getElementById('communityChallengesList');
    const noCommunityChallengesMessage = document.getElementById('noCommunityChallengesMessage');
    
    // Get all challenges
    const allChallenges = DataStore.getChallenges();
    
    // Filter challenges:
    // 1. Only community visibility
    // 2. Not created by the user
    // 3. Still open to join (end date >= today)
    // 4. Not already joined
    const today = getCurrentDateString();
    
    let communityChallenges = allChallenges.filter(challenge => 
        challenge.visibility === 'community' &&
        challenge.endDate >= today &&
        (!challenge.participants || !challenge.participants.includes('user'))
    );
    
    // Filter by type if specified
    if (filterType !== 'all') {
        communityChallenges = communityChallenges.filter(c => c.challengeType === filterType);
    }
    
    // Generate and actually save some example challenges if none exist
    if (communityChallenges.length === 0) {
        const exampleChallenges = generateExampleChallenges();
        // Add the examples to the database
        exampleChallenges.forEach(challenge => {
            // Don't add user as participant to these examples
            if (challenge.participants && challenge.participants.includes('user')) {
                challenge.participants = challenge.participants.filter(p => p !== 'user');
            }
            // Manually add to allChallenges and save to localStorage at the end
            allChallenges.push(challenge);
        });
        // Save all challenges to localStorage
        localStorage.setItem('challenges', JSON.stringify(allChallenges));
        
        // Use the newly saved examples
        communityChallenges = exampleChallenges;
    }
    
    // Check if there are any community challenges
    if (communityChallenges.length === 0) {
        noCommunityChallengesMessage.style.display = 'block';
        return;
    }
    
    // Hide the no challenges message
    noCommunityChallengesMessage.style.display = 'none';
    
    // Clear existing challenges
    challengesContainer.innerHTML = '';
    
    // Display challenges
    communityChallenges.forEach(challenge => {
        const challengeElement = document.createElement('div');
        challengeElement.className = `challenge-card p-3 mb-3 ${challenge.challengeType}`;
        challengeElement.innerHTML = `
            <div class="d-flex justify-content-between mb-2">
                <h5 class="mb-0">${challenge.name}</h5>
                <span class="badge bg-secondary">${capitalizeFirstLetter(challenge.challengeType)}</span>
            </div>
            <p class="text-muted small mb-2">${challenge.description || 'Join this community challenge!'}</p>
            <div class="small mb-3">
                <i class="fas fa-bullseye me-1"></i> Goal: ${formatNumber(challenge.goal)} ${challenge.challengeType}
            </div>
            <div class="small text-muted d-flex justify-content-between mb-3">
                <span>
                    <i class="fas fa-calendar-alt me-1"></i>
                    ${formatDate(challenge.startDate)} - ${formatDate(challenge.endDate)}
                </span>
                <span>
                    <i class="fas fa-users me-1"></i>
                    ${challenge.participants ? challenge.participants.length : 1} participants
                </span>
            </div>
            <button class="btn btn-sm btn-primary join-challenge-btn" data-challenge-id="${challenge.id}">
                Join Challenge
            </button>
        `;
        
        challengesContainer.appendChild(challengeElement);
    });
    
    // Add event listeners to join buttons
    document.querySelectorAll('.join-challenge-btn').forEach(button => {
        button.addEventListener('click', function() {
            const challengeId = this.dataset.challengeId;
            const challenge = communityChallenges.find(c => c.id === challengeId);
            if (!challenge) return;
            
            // Show join challenge modal
            displayJoinChallengeModal(challenge);
        });
    });
}

/**
 * Displays the join challenge modal
 * @param {Object} challenge - Challenge to join
 */
function displayJoinChallengeModal(challenge) {
    // Fill modal with challenge details
    document.getElementById('modalChallengeName').textContent = challenge.name;
    document.getElementById('modalChallengeDescription').textContent = challenge.description || 'Join this community challenge!';
    document.getElementById('modalChallengeType').textContent = capitalizeFirstLetter(challenge.challengeType);
    document.getElementById('modalChallengeGoal').textContent = formatNumber(challenge.goal);
    document.getElementById('modalChallengeStart').textContent = formatDate(challenge.startDate);
    document.getElementById('modalChallengeEnd').textContent = formatDate(challenge.endDate);
    document.getElementById('modalChallengeParticipants').textContent = challenge.participants ? challenge.participants.length : 1;
    
    // Remove any existing event listeners to prevent duplicates
    const confirmBtn = document.getElementById('confirmJoinBtn');
    const oldConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(oldConfirmBtn, confirmBtn);
    
    // Set up confirm join button with fresh event listener
    document.getElementById('confirmJoinBtn').addEventListener('click', function() {
        // Disable button to prevent multiple clicks
        this.disabled = true;
        
        // Join the challenge
        if (DataStore.joinChallenge(challenge.id)) {
            // Close modal
            const joinChallengeModal = bootstrap.Modal.getInstance(document.getElementById('joinChallengeModal'));
            joinChallengeModal.hide();
            
            // Reload challenges data
            displayActiveChallenges();
            const filterEl = document.getElementById('challengeTypeFilter');
            const currentFilter = filterEl ? filterEl.value : 'all';
            displayCommunityChallenges(currentFilter);
            
            // Show feedback
            showToast('You joined the challenge!', 'success');
        } else {
            // Re-enable button if failed
            this.disabled = false;
            showToast('Error joining challenge', 'danger');
        }
    });
    
    // Show modal
    const joinChallengeModal = new bootstrap.Modal(document.getElementById('joinChallengeModal'));
    joinChallengeModal.show();
}

/**
 * Displays top performers
 * @param {string} category - Category to display (steps, calories, workouts)
 */
function displayTopPerformers(category) {
    const performersContainer = document.getElementById('topPerformersList');
    
    // Clear existing performers
    performersContainer.innerHTML = '';
    
    // Get all friends
    const friends = DataStore.getFriends();
    
    // Create performers list including user
    const performers = [
        {
            name: 'You',
            steps: DataStore.getDailySteps(),
            calories: DataStore.getTotalCaloriesBurned(),
            workouts: DataStore.getWeeklyWorkouts().length
        }
    ];
    
    // Add friends
    friends.forEach(friend => {
        performers.push({
            name: friend.name,
            steps: friend.stats.steps,
            calories: friend.stats.calories,
            workouts: friend.stats.workouts
        });
    });
    
    // Add some example performers if list is short
    if (performers.length < 5) {
        const examplePerformers = [
            { name: 'Alex', steps: 12547, calories: 523, workouts: 4 },
            { name: 'Taylor', steps: 9856, calories: 452, workouts: 3 },
            { name: 'Jordan', steps: 15234, calories: 687, workouts: 5 },
            { name: 'Morgan', steps: 8761, calories: 398, workouts: 2 },
            { name: 'Casey', steps: 11382, calories: 512, workouts: 4 }
        ];
        
        // Add enough examples to make at least 5 performers
        for (let i = 0; i < 5 - performers.length; i++) {
            performers.push(examplePerformers[i]);
        }
    }
    
    // Sort by selected category
    performers.sort((a, b) => b[category] - a[category]);
    
    // Display performers
    performers.forEach((performer, index) => {
        const isUser = performer.name === 'You';
        const isTopThree = index < 3;
        
        const performerElement = document.createElement('div');
        performerElement.className = 'performer-row';
        performerElement.innerHTML = `
            <div class="rank ${isTopThree ? 'top-rank' : ''}">${index + 1}</div>
            <div class="performer-info">
                <div class="${isUser ? 'fw-bold' : ''}">${performer.name}</div>
                <div class="small text-muted">
                    ${category === 'steps' ? `${formatNumber(performer.steps)} steps` : 
                      category === 'calories' ? `${formatNumber(performer.calories)} calories` : 
                      `${performer.workouts} workouts`}
                </div>
            </div>
            <div class="performer-score">
                ${category === 'steps' ? formatNumber(performer.steps) : 
                  category === 'calories' ? formatNumber(performer.calories) : 
                  performer.workouts}
            </div>
        `;
        
        performersContainer.appendChild(performerElement);
    });
}

/**
 * Displays events feed
 * @param {string} locationFilter - Optional location filter
 */
function displayEventsFeed(locationFilter = '') {
    const eventsContainer = document.getElementById('eventsFeed');
    const noEventsMessage = document.getElementById('noEventsMessage');
    
    // Generate example events
    const events = generateExampleEvents();
    
    // Filter by location if specified
    let filteredEvents = events;
    if (locationFilter) {
        filteredEvents = events.filter(event => 
            event.location.toLowerCase().includes(locationFilter.toLowerCase())
        );
    }
    
    // Check if there are any events
    if (filteredEvents.length === 0) {
        noEventsMessage.style.display = 'block';
        return;
    }
    
    // Hide the no events message
    noEventsMessage.style.display = 'none';
    
    // Clear existing events
    eventsContainer.innerHTML = '';
    
    // Display events
    filteredEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-card p-3 mb-3';
        eventElement.innerHTML = `
            <div class="d-flex justify-content-between mb-1">
                <h6 class="mb-0">${event.name}</h6>
                <span class="badge bg-secondary">${event.type}</span>
            </div>
            <div class="small text-muted mb-2">
                <div class="event-date"><i class="fas fa-calendar-day me-1"></i> ${formatDate(event.date)}</div>
                <div class="event-location"><i class="fas fa-map-marker-alt me-1"></i> ${event.location}</div>
            </div>
            <p class="small mb-2">${event.description}</p>
            <a href="#" class="btn btn-sm btn-outline-info">Learn More</a>
        `;
        
        eventsContainer.appendChild(eventElement);
    });
}

/**
 * Sums steps between two dates
 * @param {string} startDate - Start date (inclusive)
 * @param {string} endDate - End date (inclusive)
 * @returns {number} Total steps
 */
function sumStepsBetweenDates(startDate, endDate) {
    const stepLogs = DataStore.getStepLogs();
    return stepLogs
        .filter(log => log.date >= startDate && log.date <= endDate)
        .reduce((sum, log) => sum + log.steps, 0);
}

/**
 * Generates example challenges for display
 * @returns {Array} Array of challenge objects
 */
function generateExampleChallenges() {
    const today = new Date();
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    
    const startDate = today.toISOString().split('T')[0];
    const endDate = twoWeeksLater.toISOString().split('T')[0];
    
    return [
        {
            id: 'example-1',
            name: '10K Steps Challenge',
            description: 'Complete 100,000 steps in two weeks!',
            challengeType: 'steps',
            goal: 100000,
            startDate: startDate,
            endDate: endDate,
            visibility: 'community',
            participants: ['user1', 'user2', 'user3', 'user4']
        },
        {
            id: 'example-2',
            name: 'Calorie Burn Challenge',
            description: 'Burn 5,000 calories through workouts',
            challengeType: 'calories',
            goal: 5000,
            startDate: startDate,
            endDate: endDate,
            visibility: 'community',
            participants: ['user1', 'user2']
        },
        {
            id: 'example-3',
            name: 'Workout Streak',
            description: 'Complete 12 workouts in two weeks',
            challengeType: 'workouts',
            goal: 12,
            startDate: startDate,
            endDate: endDate,
            visibility: 'community',
            participants: ['user1', 'user3', 'user5']
        }
    ];
}

/**
 * Generates example events for display
 * @returns {Array} Array of event objects
 */
function generateExampleEvents() {
    const today = new Date();
    
    // Generate dates over the next few months
    const dates = [];
    for (let i = 7; i <= 90; i += 7) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }
    
    return [
        {
            name: 'City Marathon',
            type: 'Running',
            date: dates[0],
            location: 'Downtown',
            description: 'Annual city marathon with 5K, 10K, half and full marathon options.'
        },
        {
            name: 'Yoga in the Park',
            type: 'Yoga',
            date: dates[1],
            location: 'Central Park',
            description: 'Free community yoga session for all experience levels.'
        },
        {
            name: 'Charity Bike Ride',
            type: 'Cycling',
            date: dates[2],
            location: 'Riverside',
            description: 'Fundraising bike ride with 20, 40, and 60 mile routes.'
        },
        {
            name: 'CrossFit Competition',
            type: 'CrossFit',
            date: dates[3],
            location: 'Fitness Center',
            description: 'Local CrossFit competition with beginner and advanced divisions.'
        },
        {
            name: 'Mountain Trail Run',
            type: 'Running',
            date: dates[4],
            location: 'Mountain Ridge',
            description: 'Trail running event with stunning views and challenging routes.'
        },
        {
            name: 'Community Swim Meet',
            type: 'Swimming',
            date: dates[5],
            location: 'Aquatic Center',
            description: 'Open swim competition with multiple categories and distances.'
        }
    ];
}
