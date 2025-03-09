/**
 * Community page logic for FigArt AI
 */

// State variables
let posts = [];
let likedPosts = [];
let currentSortMethod = 'recent';
let currentPage = 0;
let totalPages = 0;
let currentPostId = null;
let checkChangesInterval = null;
let lastCheckTime = new Date();

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const postsGrid = document.getElementById('postsGrid');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noPostsMessage = document.getElementById('noPostsMessage');
    const pagination = document.getElementById('pagination');
    const sortDropdownBtn = document.getElementById('sortDropdownBtn');
    const sortDropdown = document.getElementById('sortDropdown');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const uploadForm = document.getElementById('uploadForm');
    const photoUpload = document.getElementById('photoUpload');
    const selectedFileName = document.getElementById('selectedFileName');
    const submitUploadBtn = document.getElementById('submitUpload');
    const newPostsAlert = document.getElementById('newPostsAlert');
    const newPostsCount = document.getElementById('newPostsCount');
    const refreshPostsBtn = document.getElementById('refreshPostsBtn');
    const dismissAlertBtn = document.getElementById('dismissAlertBtn');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const paginationNumbers = document.getElementById('paginationNumbers');
    const postDetailModal = document.getElementById('postDetailModal');
    const postDetailImage = document.getElementById('postDetailImage');
    const postAuthor = document.getElementById('postAuthor');
    const postDate = document.getElementById('postDate');
    const likePostBtn = document.getElementById('likePostBtn');
    const likeCount = document.getElementById('likeCount');
    const deletePostBtn = document.getElementById('deletePostBtn');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const commentsContainer = document.getElementById('commentsContainer');
    const commentForm = document.getElementById('commentForm');
    const commentInput = document.getElementById('commentInput');
    const closeButtons = document.querySelectorAll('.close-btn');
    const noPostsUploadBtn = document.getElementById('noPostsUploadBtn');
    
    // Initialize
    init();
    
    // Initialize the page
    async function init() {
        // Check if user is authenticated
        if (!isAuthenticated() && document.referrer.indexOf('login.html') === -1 && document.referrer.indexOf('register.html') === -1) {
            // Redirect to login page if not coming from login or register
            window.location.href = 'login.html';
            return;
        }
        
        // Load initial data
        await fetchPosts();
        
        // Set up event listeners
        setupEventListeners();
        
        // Start polling for changes
        startChangePolling();
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Sort dropdown toggle
        sortDropdownBtn.addEventListener('click', function() {
            sortDropdown.classList.toggle('hidden');
            sortDropdownBtn.classList.toggle('active');
        });
        
        // Sort options
        sortDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const sortMethod = this.getAttribute('data-sort');
                if (sortMethod !== currentSortMethod) {
                    currentSortMethod = sortMethod;
                    document.getElementById('currentSort').textContent = 
                        sortMethod === 'recent' ? '最新作品' : '热门作品';
                    sortDropdown.classList.add('hidden');
                    sortDropdownBtn.classList.remove('active');
                    currentPage = 0;
                    fetchPosts();
                }
            });
        });
        
        // Upload button click
        uploadBtn.addEventListener('click', function() {
            if (!isAuthenticated()) {
                window.location.href = 'login.html';
                return;
            }
            openUploadModal();
        });
        
        // No posts upload button
        if (noPostsUploadBtn) {
            noPostsUploadBtn.addEventListener('click', function() {
                if (!isAuthenticated()) {
                    window.location.href = 'login.html';
                    return;
                }
                openUploadModal();
            });
        }
        
        // File input change
        photoUpload.addEventListener('change', function() {
            updateFileSelection();
        });
        
        // File drop zone
        const fileInputContainer = document.querySelector('.file-input-container');
        
        fileInputContainer.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        fileInputContainer.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        fileInputContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            if (e.dataTransfer.files.length) {
                photoUpload.files = e.dataTransfer.files;
                updateFileSelection();
            }
        });
        
        // Upload form submission
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleUpload();
        });
        
        // Cancel upload buttons
        document.querySelectorAll('.cancel-upload').forEach(btn => {
            btn.addEventListener('click', function() {
                closeUploadModal();
            });
        });
        
        // Close buttons for modals
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                modal.classList.add('hidden');
                
                // If it's the post detail modal, reset current post
                if (modal.id === 'postDetailModal') {
                    currentPostId = null;
                }
            });
        });
        
        // New posts alert actions
        refreshPostsBtn.addEventListener('click', async function() {
            newPostsAlert.classList.add('hidden');
            lastCheckTime = new Date();
            await fetchPosts();
        });
        
        dismissAlertBtn.addEventListener('click', function() {
            newPostsAlert.classList.add('hidden');
            lastCheckTime = new Date();
        });
        
        // Pagination buttons
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 0) {
                currentPage--;
                fetchPosts();
            }
        });
        
        nextPageBtn.addEventListener('click', function() {
            if (currentPage < totalPages - 1) {
                currentPage++;
                fetchPosts();
            }
        });
        
        // Like post button
        likePostBtn.addEventListener('click', async function() {
            if (!currentPostId) return;
            
            if (!isAuthenticated()) {
                window.location.href = 'login.html';
                return;
            }
            
            // Check if already liked
            const isLiked = likedPosts.includes(currentPostId);
            
            try {
                const endpoint = isLiked ? 
                    `/posts/${currentPostId}/thumbs-down/` : 
                    `/posts/${currentPostId}/thumbs-up/`;
                
                await apiRequest(endpoint, { method: 'POST' });
                
                // Update liked posts list
                if (isLiked) {
                    likedPosts = likedPosts.filter(id => id !== currentPostId);
                    likePostBtn.classList.remove('liked');
                    likeCount.textContent = parseInt(likeCount.textContent) - 1;
                } else {
                    likedPosts.push(currentPostId);
                    likePostBtn.classList.add('liked');
                    likeCount.textContent = parseInt(likeCount.textContent) + 1;
                }
                
                // Update post in grid
                updatePostLikeStatus(currentPostId, !isLiked);
                
            } catch (error) {
                console.error('Error toggling like:', error);
                alert('操作失败，请稍后再试');
            }
        });
        
        // Delete post button
        deletePostBtn.addEventListener('click', function() {
            if (!currentPostId) return;
            deleteConfirmModal.classList.remove('hidden');
        });
        
        // Confirm delete button
        confirmDeleteBtn.addEventListener('click', async function() {
            if (!currentPostId) return;
            
            try {
                await apiRequest(`/posts/${currentPostId}/delete/`, { method: 'POST' });
                
                // Close modals
                deleteConfirmModal.classList.add('hidden');
                postDetailModal.classList.add('hidden');
                
                // Remove post from grid and local state
                removePostFromGrid(currentPostId);
                currentPostId = null;
                
                // Show success message
                alert('作品已成功删除');
                
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('删除失败，请稍后再试');
            }
        });
        
        // Cancel delete button
        cancelDeleteBtn.addEventListener('click', function() {
            deleteConfirmModal.classList.add('hidden');
        });
        
        // Comment form submission
        commentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!currentPostId) return;
            
            const comment = commentInput.value.trim();
            if (!comment) return;
            
            try {
                const formData = new FormData();
                formData.append('content', comment);
                
                const response = await apiRequest(`/posts/${currentPostId}/comment/add/`, {
                    method: 'POST',
                    body: formData
                });
                
                // Clear input
                commentInput.value = '';
                
                // Refresh comments
                await loadComments(currentPostId);
                
            } catch (error) {
                console.error('Error adding comment:', error);
                alert('评论失败，请稍后再试');
            }
        });
        
        // Click outside dropdown to close
        document.addEventListener('click', function(e) {
            if (!sortDropdownBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
                sortDropdown.classList.add('hidden');
                sortDropdownBtn.classList.remove('active');
            }
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            const modals = [uploadModal, postDetailModal, deleteConfirmModal];
            
            modals.forEach(modal => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                    
                    // Reset current post if closing post detail
                    if (modal.id === 'postDetailModal') {
                        currentPostId = null;
                    }
                }
            });
        });
    }
    
    // Start polling for changes
    function startChangePolling() {
        // Check for changes every 15 seconds
        checkChangesInterval = setInterval(checkForChanges, 15000);
        
        // Also check immediately
        checkForChanges();
    }
    
    // Check for new posts or updates
    async function checkForChanges() {
        try {
            const isoTime = lastCheckTime.toISOString();
            const response = await apiRequest(`/posts/changed?since=${isoTime}`);
            
            // Update last check time
            lastCheckTime = new Date();
            
            if (response && response.new_posts && response.new_posts.length > 0) {
                // Show notification with count of new posts
                newPostsCount.textContent = `有 ${response.new_posts.length} 个新作品`;
                newPostsAlert.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error checking for changes:', error);
        }
    }
    
    // Fetch posts from API
    async function fetchPosts() {
        try {
            loadingIndicator.classList.remove('hidden');
            postsGrid.querySelectorAll('.post-card').forEach(el => el.remove());
            
            // Get liked posts first if authenticated
            if (isAuthenticated()) {
                try {
                    const likedResponse = await apiRequest('/users/liked-posts/');
                    if (likedResponse && likedResponse.liked_posts) {
                        likedPosts = likedResponse.liked_posts;
                    }
                } catch (error) {
                    console.error('Error fetching liked posts:', error);
                    // Continue with empty liked posts if fetch fails
                    likedPosts = [];
                }
            } else {
                likedPosts = [];
            }
            
            // Fetch posts with current filters
            const endpoint = `/posts/?sort_by=${currentSortMethod}&page=${currentPage}`;
            const response = await apiRequest(endpoint);
            
            posts = response.posts || [];
            totalPages = response.pagination ? response.pagination.pages : 0;
            
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            
            // Update pagination
            updatePagination();
            
            // Render posts
            renderPosts();
            
        } catch (error) {
            console.error('Error fetching posts:', error);
            loadingIndicator.classList.add('hidden');
            postsGrid.innerHTML = '<div class="error-message">加载作品时出错，请稍后再试</div>';
        }
    }
    
    // Render posts in the grid
    function renderPosts() {
        // Clear existing posts
        postsGrid.querySelectorAll('.post-card, .loading-indicator, .error-message').forEach(el => el.remove());
        
        // Show/hide messages based on posts count
        if (posts.length === 0) {
            noPostsMessage.classList.remove('hidden');
            pagination.classList.add('hidden');
        } else {
            noPostsMessage.classList.add('hidden');
            pagination.classList.remove('hidden');
            
            // Create post cards
            posts.forEach(post => {
                const postCard = createPostCard(post);
                postsGrid.appendChild(postCard);
            });
        }
    }
    
    // Create a post card element
    function createPostCard(post) {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.setAttribute('data-post-id', post.id);
        
        // Check if user has liked this post
        const isLiked = likedPosts.includes(post.id);
        
        const formattedDate = formatDate(post.created_at);
        const photoUrl = getPhotoUrl(post.photo_uuid);
        
        postCard.innerHTML = `
            <div class="post-image">
                <img src="${photoUrl}" alt="Post by ${post.user_id}" loading="lazy" />
            </div>
            <div class="post-info">
                <div class="post-author">${post.user_id}</div>
                <div class="post-date">${formattedDate}</div>
                <div class="post-stats">
                    <div class="post-likes ${isLiked ? 'liked' : ''}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                        </svg>
                        ${post.thumbs_up}
                    </div>
                </div>
            </div>
        `;
        
        // Add click event to open post detail
        postCard.addEventListener('click', function() {
            openPostDetail(post.id);
        });
        
        return postCard;
    }
    
    // Open post detail modal
    async function openPostDetail(postId) {
        try {
            currentPostId = postId;
            
            // Get the post from local state or fetch from API
            let post = posts.find(p => p.id === postId);
            
            if (!post) {
                const response = await apiRequest(`/posts/${postId}/`);
                if (response && response.id) {
                    post = response;
                } else {
                    throw new Error('Post not found');
                }
            }
            
            // Update modal content
            const photoUrl = getPhotoUrl(post.photo_uuid);
            const formattedDate = formatDate(post.created_at);
            const isLiked = likedPosts.includes(post.id);
            
            postDetailImage.src = photoUrl;
            postAuthor.textContent = post.user_id;
            postDate.textContent = formattedDate;
            likeCount.textContent = post.thumbs_up;
            
            if (isLiked) {
                likePostBtn.classList.add('liked');
            } else {
                likePostBtn.classList.remove('liked');
            }
            
            // Show delete button if user is the author
            if (post.user_id === getUsername()) {
                deletePostBtn.classList.remove('hidden');
            } else {
                deletePostBtn.classList.add('hidden');
            }
            
            // Load comments
            await loadComments(postId);
            
            // Show modal
            postDetailModal.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error opening post detail:', error);
            alert('无法加载作品详情，请稍后再试');
        }
    }
    
    // Load comments for a post
    async function loadComments(postId) {
        try {
            const response = await apiRequest(`/posts/${postId}/comments/`);
            
            // Clear existing comments
            commentsContainer.innerHTML = '';
            
            if (response && response.comments && response.comments.length > 0) {
                // Render comments
                response.comments.forEach(comment => {
                    const commentEl = createCommentElement(comment);
                    commentsContainer.appendChild(commentEl);
                });
            } else {
                // Show empty state
                commentsContainer.innerHTML = '<div class="no-comments">还没有评论，成为第一个评论的人吧！</div>';
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            commentsContainer.innerHTML = '<div class="error-message">无法加载评论，请稍后再试</div>';
        }
    }
    
    // Create a comment element
    function createCommentElement(comment) {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment';
        commentEl.setAttribute('data-comment-id', comment.id);
        
        const formattedDate = formatDate(comment.created_at);
        const isCurrentUser = comment.username === getUsername();
        
        commentEl.innerHTML = `
            <div class="comment-content">
                <div class="comment-header">
                    <div class="comment-author">${comment.username}</div>
                    <div class="comment-date">${formattedDate}</div>
                </div>
                <div class="comment-text">${comment.content}</div>
            </div>
            ${isCurrentUser ? `
            <div class="comment-actions">
                <button class="delete-comment-btn" data-comment-id="${comment.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </button>
            </div>
            ` : ''}
        `;
        
        // Add delete handler if current user's comment
        if (isCurrentUser) {
            const deleteBtn = commentEl.querySelector('.delete-comment-btn');
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteComment(comment.id);
            });
        }
        
        return commentEl;
    }
    
    // Delete a comment
    async function deleteComment(commentId) {
        if (!confirm('确定要删除这条评论吗？')) {
            return;
        }
        
        try {
            await apiRequest(`/posts/${currentPostId}/comment/${commentId}/delete/`, {
                method: 'POST'
            });
            
            // Remove comment from DOM
            const commentEl = commentsContainer.querySelector(`[data-comment-id="${commentId}"]`);
            if (commentEl) {
                commentEl.remove();
            }
            
            // If no more comments, show empty state
            if (commentsContainer.children.length === 0) {
                commentsContainer.innerHTML = '<div class="no-comments">还没有评论，成为第一个评论的人吧！</div>';
            }
            
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('删除评论失败，请稍后再试');
        }
    }
    
    // Update pagination controls
    function updatePagination() {
        // Update prev/next buttons
        prevPageBtn.disabled = currentPage === 0;
        nextPageBtn.disabled = currentPage >= totalPages - 1;
        
        // Generate page numbers
        paginationNumbers.innerHTML = '';
        
        // Only show pagination if we have more than one page
        if (totalPages <= 1) {
            pagination.classList.add('hidden');
            return;
        }
        
        pagination.classList.remove('hidden');
        
        // Determine range of pages to show
        let startPage = Math.max(0, currentPage - 2);
        let endPage = Math.min(totalPages - 1, startPage + 4);
        
        // Adjust if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(0, endPage - 4);
        }
        
        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            const pageNumber = document.createElement('div');
            pageNumber.className = `page-number ${i === currentPage ? 'active' : ''}`;
            pageNumber.textContent = i + 1;
            
            pageNumber.addEventListener('click', function() {
                if (i !== currentPage) {
                    currentPage = i;
                    fetchPosts();
                }
            });
            
            paginationNumbers.appendChild(pageNumber);
        }
    }
    
    // Open upload modal
    function openUploadModal() {
        // Reset form and file selection
        uploadForm.reset();
        selectedFileName.textContent = '';
        submitUploadBtn.disabled = true;
        
        // Show modal
        uploadModal.classList.remove('hidden');
    }
    
    // Close upload modal
    function closeUploadModal() {
        uploadModal.classList.add('hidden');
    }
    
    // Update file selection UI
    function updateFileSelection() {
        const files = photoUpload.files;
        
        if (files.length > 0) {
            const file = files[0];
            
            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('请选择图片文件');
                photoUpload.value = '';
                selectedFileName.textContent = '';
                submitUploadBtn.disabled = true;
                return;
            }
            
            // Update UI
            selectedFileName.textContent = file.name;
            submitUploadBtn.disabled = false;
        } else {
            selectedFileName.textContent = '';
            submitUploadBtn.disabled = true;
        }
    }
    
    // Handle file upload
    async function handleUpload() {
        if (!isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
        
        const files = photoUpload.files;
        if (!files.length) {
            alert('请选择图片文件');
            return;
        }
        
        const file = files[0];
        
        // Hide form and show progress
        uploadForm.classList.add('hidden');
        const progressContainer = document.getElementById('uploadProgress');
        const progressBar = progressContainer.querySelector('.progress-bar');
        const progressText = progressContainer.querySelector('.progress-text');
        progressContainer.classList.remove('hidden');
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            // Simulate progress for better UX
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 5;
                if (progress > 90) {
                    clearInterval(progressInterval);
                    progress = 90;
                }
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `上传中 (${Math.round(progress)}%)...`;
            }, 200);
            
            // Send upload request
            const response = await apiRequest('/posts/create/', {
                method: 'POST',
                body: formData,
                headers: {
                    // Don't set Content-Type, let the browser set it with the boundary
                }
            });
            
            // Complete progress animation
            clearInterval(progressInterval);
            progressBar.style.width = '100%';
            progressText.textContent = '上传完成!';
            
            // Wait a moment to show completion then close modal
            setTimeout(() => {
                closeUploadModal();
                
                // Reset form and UI
                uploadForm.reset();
                uploadForm.classList.remove('hidden');
                progressContainer.classList.add('hidden');
                progressBar.style.width = '0';
                
                // Refresh posts to show the new one
                fetchPosts();
                
            }, 1000);
            
        } catch (error) {
            console.error('Upload error:', error);
            
            // Show error
            progressText.textContent = '上传失败: ' + (error.message || '未知错误');
            progressBar.style.width = '0';
            
            // Add button to try again
            const retryButton = document.createElement('button');
            retryButton.className = 'btn btn-primary';
            retryButton.textContent = '重试';
            retryButton.style.marginTop = '1rem';
            
            retryButton.addEventListener('click', function() {
                progressContainer.classList.add('hidden');
                uploadForm.classList.remove('hidden');
                
                // Remove this button
                this.remove();
            });
            
            progressContainer.appendChild(retryButton);
        }
    }
    
    // Update a post's like status in the grid
    function updatePostLikeStatus(postId, isLiked) {
        const postCard = postsGrid.querySelector(`[data-post-id="${postId}"]`);
        if (!postCard) return;
        
        const likesEl = postCard.querySelector('.post-likes');
        
        if (isLiked) {
            likesEl.classList.add('liked');
            // Find the post in our data and update thumbs up count
            const post = posts.find(p => p.id === postId);
            if (post) {
                post.thumbs_up++;
                likesEl.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                    </svg>
                    ${post.thumbs_up}
                `;
            }
        } else {
            likesEl.classList.remove('liked');
            // Find the post in our data and update thumbs up count
            const post = posts.find(p => p.id === postId);
            if (post && post.thumbs_up > 0) {
                post.thumbs_up--;
                likesEl.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                    </svg>
                    ${post.thumbs_up}
                `;
            }
        }
    }
    
    // Remove a post from the grid
    function removePostFromGrid(postId) {
        // Remove from DOM
        const postCard = postsGrid.querySelector(`[data-post-id="${postId}"]`);
        if (postCard) {
            postCard.remove();
        }
        
        // Remove from data
        posts = posts.filter(p => p.id !== postId);
        
        // Update empty state
        if (posts.length === 0) {
            noPostsMessage.classList.remove('hidden');
            pagination.classList.add('hidden');
        }
    }
    
    // Cleanup when leaving the page
    window.addEventListener('beforeunload', function() {
        if (checkChangesInterval) {
            clearInterval(checkChangesInterval);
        }
    });
}); 