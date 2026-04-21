/**
 * team.js - Team profile rendering logic
 */
const TeamFeature = {
  init: async function () {
    const container = $("#team-container");
    if (container.length === 0) return;
    
    const masterData = await Data.loadMasterData();
    const team = masterData.team || [];
    const images = masterData.assets_manifest["meet-team-page"] || [];
    
    if (!team || team.length === 0) {
      container.html('<p class="text-center">Team details coming soon.</p>');
      return;
    }

    container.empty();
    team.forEach((person, index) => {
      const isEven = index % 2 === 0;
      const alignmentClass = isEven ? "image-left" : "image-right";
      
      // Use direct imageUrl if provided, otherwise fallback to manifest logic
      let imageUrl = person.imageUrl || "";
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('assets/')) {
          const firstName = person.name.split(' ')[0].toLowerCase();
          const matchedImage = images.find(img => img.toLowerCase().includes(firstName)) || images[0];
          imageUrl = `assets/images/meet-team-page/${matchedImage}`;
      }

      container.append(`
                <div class="profile-card ${alignmentClass}">
                    <div class="profile-image">
                        <img src="${imageUrl}" alt="${person.name}">
                    </div>
                    <div class="profile-text">
                        <h3>${person.name}</h3>
                        <span class="role">${person.role}</span>
                        <p class="bio">${person.bio}</p>
                    </div>
                </div>
            `);
    });
  }
};
