document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch listings
        const response = await fetch('/api/listings');
        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }
        const listings = await response.json();

        // Get the gallery container
        const galleryGrid = document.getElementById('gallery-grid');

        // Create and append image cards for each listing
        listings.forEach(listing => {
            const card = document.createElement('div');
            card.className = 'col';

            // Extract image URL from the listing
            const imageUrl = listing.url; // Assuming 'url' contains the image link

            const cardBody = `
                <div class="card h-100">
                    <img src="${imageUrl}" class="card-img-top" alt="${listing.caption || listing.name}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${listing.caption || listing.name}</h5>
                    </div>
                </div>
            `;
            card.innerHTML = cardBody;
            galleryGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading gallery:', error);
        const galleryGrid = document.getElementById('gallery-grid');
        galleryGrid.innerHTML = `<div class="alert alert-danger">Error loading gallery: ${error.message}</div>`;
    }
});
