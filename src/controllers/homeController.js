const HomeContent = require("../models/HomeContent");
const Principal = require("../models/Principal");
const Logo = require("../models/Logo");
const path = require("path");
const fs = require("fs").promises;

exports.getHomePage = async (req, res) => {
  try {
    const homeContent = (await HomeContent.findOne()) || new HomeContent({});
    const principal = await Principal.findOne();
    const logo = await Logo.findOne();
    res.render("pages/home", {
      homeContent,
      principal,
      logo,
      pageTitle: "Home",
      history: homeContent.history || '',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.getEditPage = async (req, res) => {
  try {
    const homeContent = (await HomeContent.findOne()) || new HomeContent({});
    res.render("admin/home/edit", {
      homeContent,
      title: "Edit Home Content",
      history: homeContent.history || '',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.updateContent = async (req, res) => {
  try {
    //console.log("=== Starting Home Content Update ===");
    //console.log("Request body keys:", Object.keys(req.body));
    //console.log("Files received:", req.files ? req.files.length : 0);
    
    let homeContent = (await HomeContent.findOne()) || new HomeContent();

    // Handle banner slides with proper image preservation
    const bannerSlidesData = JSON.parse(req.body.bannerSlides || "[]");
    const files = req.files || [];
    
    //console.log("Banner slides data:", bannerSlidesData.length, "slides");
    //console.log("Files received:", files.map(f => f.fieldname));
    
    // Process each banner slide
    homeContent.bannerSlides = bannerSlidesData.map((slideData, index) => {
      const slide = {
        title: slideData.title || '',
        subtitle: slideData.subtitle || '',
        ctaText: slideData.ctaText || '',
        ctaLink: slideData.ctaLink || '',
        isActive: slideData.isActive === 'true',
        order: index,
      };

      // Check if there's a new image file for this specific slide
      const slideImageFile = files.find(f => f.fieldname === `bannerSlides[${index}][image]`);
      
      if (slideImageFile) {
        // New image uploaded - delete old image if exists
        if (slideData.imageUrl) {
          try {
            fs.unlink(path.join("public", slideData.imageUrl)).catch(console.error);
            //console.log(`Deleted old image: ${slideData.imageUrl}`);
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }
        slide.imageUrl = `/uploads/banners/${slideImageFile.filename}`;
        //console.log(`New image uploaded for slide ${index}:`, slide.imageUrl);
      } else if (slideData.imageUrl) {
        // No new image - preserve existing image
        slide.imageUrl = slideData.imageUrl;
        //console.log(`Preserving existing image for slide ${index}:`, slideData.imageUrl);
      } else {
        // No image at all
        slide.imageUrl = null;
        //console.log(`No image for slide ${index}`);
      }

      return slide;
    })
    // Filter: only keep slides with non-empty title, imageUrl, and isActive true
    .filter(slide => slide.title && slide.imageUrl && slide.isActive);

    // Update basic home content
    homeContent.welcomeTitle = req.body.welcomeTitle || '';
    homeContent.welcomeContent = req.body.welcomeContent || '';
    homeContent.featuredSections = JSON.parse(req.body.featuredSections || "[]");
    homeContent.history = req.body.history || '';

    // Process Our Society section
    if (req.body.ourSociety) {
      homeContent.ourSociety = {
        title: req.body.ourSociety.title || 'Our Society',
        content: req.body.ourSociety.content || '',
        isActive: req.body.ourSociety.isActive === 'true',
        image: homeContent.ourSociety?.image || null
      };
      
      // Handle image upload for Our Society
      const societyFile = files.find(f => f.fieldname === 'ourSociety[image]');
      if (societyFile) {
        if (homeContent.ourSociety.image) {
          try {
            fs.unlink(path.join("public", homeContent.ourSociety.image)).catch(console.error);
          } catch (error) {
            console.error("Error deleting old society image:", error);
          }
        }
        homeContent.ourSociety.image = `/uploads/sections/${societyFile.filename}`;
      } else if (req.body.ourSociety.imageUrl) {
        homeContent.ourSociety.image = req.body.ourSociety.imageUrl;
      }
    }

    // Process Who We Are section
    if (req.body.whoWeAre) {
      homeContent.whoWeAre = {
        title: req.body.whoWeAre.title || 'Who We Are',
        content: req.body.whoWeAre.content || '',
        isActive: req.body.whoWeAre.isActive === 'true',
        image: homeContent.whoWeAre?.image || null
      };
      
      // Handle image upload for Who We Are
      const whoWeAreFile = files.find(f => f.fieldname === 'whoWeAre[image]');
      if (whoWeAreFile) {
        if (homeContent.whoWeAre.image) {
          try {
            fs.unlink(path.join("public", homeContent.whoWeAre.image)).catch(console.error);
          } catch (error) {
            console.error("Error deleting old who we are image:", error);
          }
        }
        homeContent.whoWeAre.image = `/uploads/sections/${whoWeAreFile.filename}`;
      } else if (req.body.whoWeAre.imageUrl) {
        homeContent.whoWeAre.image = req.body.whoWeAre.imageUrl;
      }
    }

    // Process Infrastructure section
    if (req.body.infrastructure) {
      //console.log("=== Infrastructure Processing ===");
      
      homeContent.infrastructure = {
        title: req.body.infrastructure.title || 'Infrastructure',
        subtitle: req.body.infrastructure.subtitle || 'Our Facilities',
        content: req.body.infrastructure.content || '',
        isActive: req.body.infrastructure.isActive === 'true',
        image: homeContent.infrastructure?.image || null
      };
      
      // Handle image upload for Infrastructure
      const infrastructureFile = files.find(f => f.fieldname === 'infrastructure[image]');
      if (infrastructureFile) {
        if (homeContent.infrastructure.image) {
          try {
            fs.unlink(path.join("public", homeContent.infrastructure.image)).catch(console.error);
          } catch (error) {
            console.error("Error deleting old infrastructure image:", error);
          }
        }
        homeContent.infrastructure.image = `/uploads/sections/${infrastructureFile.filename}`;
      } else if (req.body.infrastructure.imageUrl) {
        homeContent.infrastructure.image = req.body.infrastructure.imageUrl;
      }

      //console.log(`Processed infrastructure section with image: ${homeContent.infrastructure.image ? 'Yes' : 'No'}`);
    }

    // Process Recent Announcements section
    if (req.body.recentAnnouncements) {
      //console.log("=== Recent Announcements Processing ===");
      
      homeContent.recentAnnouncements = {
        title: req.body.recentAnnouncements.title || 'Recent Announcements',
        subtitle: req.body.recentAnnouncements.subtitle || 'Stay Updated',
        isActive: req.body.recentAnnouncements.isActive === 'true',
        announcements: []
      };

      // Process announcements - handle both JSON and individual field formats
      let announcements = [];
      
      // First, try JSON format
      if (req.body['recentAnnouncements[announcements]']) {
        try {
          const announcementsData = JSON.parse(req.body['recentAnnouncements[announcements]']);
          //console.log("Parsed announcements from JSON:", announcementsData.length, "announcements");
          
          announcements = announcementsData.map((announcement, index) => {
            return {
              title: announcement.title || '',
              content: announcement.content || '',
              date: announcement.date || new Date().toISOString(),
              isActive: announcement.isActive === true
            };
          });
        } catch (error) {
          console.error("Error parsing announcements JSON:", error);
        }
      }
      
      // If no announcements found in JSON, try individual field format
      if (announcements.length === 0) {
        //console.log("Trying individual field format for announcements");
        let index = 0;
        while (req.body[`recentAnnouncements[announcements][${index}][title]`]) {
          //console.log(`Found announcement ${index} (individual field):`, req.body[`recentAnnouncements[announcements][${index}][title]`]);
          const announcement = {
            title: req.body[`recentAnnouncements[announcements][${index}][title]`] || '',
            content: req.body[`recentAnnouncements[announcements][${index}][content]`] || '',
            date: req.body[`recentAnnouncements[announcements][${index}][date]`] || new Date().toISOString(),
            isActive: req.body[`recentAnnouncements[announcements][${index}][isActive]`] === 'true',
            images: []
          };

          // Handle multiple images for announcement
          const announcementFiles = files.filter(f => f.fieldname === `recentAnnouncements[announcements][${index}][images]`);
          if (announcementFiles.length > 0) {
            announcement.images = announcementFiles.map(file => `/uploads/announcements/${file.filename}`);
          } else if (req.body[`recentAnnouncements[announcements][${index}][existingImages]`]) {
            try {
              announcement.images = JSON.parse(req.body[`recentAnnouncements[announcements][${index}][existingImages]`]);
            } catch (error) {
              console.error("Error parsing existing images for announcement:", error);
              announcement.images = [];
            }
          }

          announcements.push(announcement);
          index++;
        }
      }

      homeContent.recentAnnouncements.announcements = announcements;
      //console.log(`Processed ${homeContent.recentAnnouncements.announcements.length} announcements`);
    }

    // Process Sports Achievements section
    if (req.body.sportsAchievements) {
      //console.log("=== Sports Achievements Processing ===");
      
      homeContent.sportsAchievements = {
        title: req.body.sportsAchievements.title || 'Sports Achievements',
        subtitle: req.body.sportsAchievements.subtitle || 'Excellence in Sports',
        content: req.body.sportsAchievements.content || '',
        isActive: req.body.sportsAchievements.isActive === 'true',
        achievements: []
      };

      // Process sports achievements - handle both JSON and individual field formats
      let achievements = [];
      
      // First, try JSON format
      if (req.body['sportsAchievements[achievements]']) {
        try {
          const achievementsData = JSON.parse(req.body['sportsAchievements[achievements]']);
          //console.log("Parsed sports achievements from JSON:", achievementsData.length, "achievements");
          
          achievements = achievementsData.map((achievement, index) => {
            const achievementItem = {
              title: achievement.title || '',
              description: achievement.description || '',
              category: achievement.category || 'sports',
              date: achievement.date || new Date().toISOString(),
              isActive: achievement.isActive === true,
              images: []
            };

            // Handle multiple images for achievement
            const achievementFiles = files.filter(f => f.fieldname === `sportsAchievements[achievements][${index}][images]`);
            if (achievementFiles.length > 0) {
              achievementItem.images = achievementFiles.map(file => `/uploads/achievements/${file.filename}`);
            } else if (achievement.existingImages) {
              try {
                achievementItem.images = JSON.parse(achievement.existingImages);
              } catch (error) {
                console.error("Error parsing existing images for sports achievement:", error);
                achievementItem.images = [];
              }
            }

            return achievementItem;
          });
        } catch (error) {
          console.error("Error parsing sports achievements JSON:", error);
        }
      }
      
      // If no achievements found in JSON, try individual field format
      if (achievements.length === 0) {
        //console.log("Trying individual field format for sports achievements");
        let index = 0;
        while (req.body[`sportsAchievements[achievements][${index}][title]`]) {
          //console.log(`Found sports achievement ${index} (individual field):`, req.body[`sportsAchievements[achievements][${index}][title]`]);
          const achievement = {
            title: req.body[`sportsAchievements[achievements][${index}][title]`] || '',
            description: req.body[`sportsAchievements[achievements][${index}][description]`] || '',
            category: req.body[`sportsAchievements[achievements][${index}][category]`] || 'sports',
            date: req.body[`sportsAchievements[achievements][${index}][date]`] || new Date().toISOString(),
            isActive: req.body[`sportsAchievements[achievements][${index}][isActive]`] === 'true',
            images: []
          };

          // Handle multiple images for achievement
          const achievementFiles = files.filter(f => f.fieldname === `sportsAchievements[achievements][${index}][images]`);
          if (achievementFiles.length > 0) {
            achievement.images = achievementFiles.map(file => `/uploads/achievements/${file.filename}`);
          } else if (req.body[`sportsAchievements[achievements][${index}][existingImages]`]) {
            try {
              achievement.images = JSON.parse(req.body[`sportsAchievements[achievements][${index}][existingImages]`]);
            } catch (error) {
              console.error("Error parsing existing images for sports achievement:", error);
              achievement.images = [];
            }
          }

          achievements.push(achievement);
          index++;
        }
      }

      homeContent.sportsAchievements.achievements = achievements;
      //console.log(`Processed ${homeContent.sportsAchievements.achievements.length} sports achievements`);
    }

    // Process Co-Curricular Achievements section
    if (req.body.coCurricularAchievements) {
      //console.log("=== Co-Curricular Achievements Processing ===");
      
      homeContent.coCurricularAchievements = {
        title: req.body.coCurricularAchievements.title || 'Co-Curricular Achievements',
        subtitle: req.body.coCurricularAchievements.subtitle || 'Excellence Beyond Academics',
        content: req.body.coCurricularAchievements.content || '',
        isActive: req.body.coCurricularAchievements.isActive === 'true',
        achievements: []
      };

      // Process co-curricular achievements - handle both JSON and individual field formats
      let achievements = [];
      
      // First, try JSON format
      if (req.body['coCurricularAchievements[achievements]']) {
        try {
          const achievementsData = JSON.parse(req.body['coCurricularAchievements[achievements]']);
          //console.log("Parsed co-curricular achievements from JSON:", achievementsData.length, "achievements");
          
          achievements = achievementsData.map((achievement, index) => {
            const achievementItem = {
              title: achievement.title || '',
              description: achievement.description || '',
              category: achievement.category || 'cultural',
              date: achievement.date || new Date().toISOString(),
              isActive: achievement.isActive === true,
              images: []
            };

            // Handle multiple images for achievement
            const achievementFiles = files.filter(f => f.fieldname === `coCurricularAchievements[achievements][${index}][images]`);
            if (achievementFiles.length > 0) {
              achievementItem.images = achievementFiles.map(file => `/uploads/achievements/${file.filename}`);
            } else if (achievement.existingImages) {
              try {
                achievementItem.images = JSON.parse(achievement.existingImages);
              } catch (error) {
                console.error("Error parsing existing images for co-curricular achievement:", error);
                achievementItem.images = [];
              }
            }

            return achievementItem;
          });
        } catch (error) {
          console.error("Error parsing co-curricular achievements JSON:", error);
        }
      }
      
      // If no achievements found in JSON, try individual field format
      if (achievements.length === 0) {
        //console.log("Trying individual field format for co-curricular achievements");
        let index = 0;
        while (req.body[`coCurricularAchievements[achievements][${index}][title]`]) {
          //console.log(`Found co-curricular achievement ${index} (individual field):`, req.body[`coCurricularAchievements[achievements][${index}][title]`]);
          const achievement = {
            title: req.body[`coCurricularAchievements[achievements][${index}][title]`] || '',
            description: req.body[`coCurricularAchievements[achievements][${index}][description]`] || '',
            category: req.body[`coCurricularAchievements[achievements][${index}][category]`] || 'cultural',
            date: req.body[`coCurricularAchievements[achievements][${index}][date]`] || new Date().toISOString(),
            isActive: req.body[`coCurricularAchievements[achievements][${index}][isActive]`] === 'true',
            images: []
          };

          // Handle multiple images for achievement
          const achievementFiles = files.filter(f => f.fieldname === `coCurricularAchievements[achievements][${index}][images]`);
          if (achievementFiles.length > 0) {
            achievement.images = achievementFiles.map(file => `/uploads/achievements/${file.filename}`);
          } else if (req.body[`coCurricularAchievements[achievements][${index}][existingImages]`]) {
            try {
              achievement.images = JSON.parse(req.body[`coCurricularAchievements[achievements][${index}][existingImages]`]);
            } catch (error) {
              console.error("Error parsing existing images for co-curricular achievement:", error);
              achievement.images = [];
            }
          }

          achievements.push(achievement);
          index++;
        }
      }

      homeContent.coCurricularAchievements.achievements = achievements;
      //console.log(`Processed ${homeContent.coCurricularAchievements.achievements.length} co-curricular achievements`);
    }

    // Process Achievers section
    if (req.body.achievers) {
      //console.log("=== Achievers Processing ===");
      
      homeContent.achievers = {
        title: req.body.achievers.title || 'Our Achievers',
        subtitle: req.body.achievers.subtitle || 'Celebrating Success',
        content: req.body.achievers.content || '',
        isActive: req.body.achievers.isActive === 'true',
        achievers: []
      };

      // Process achievers - handle both JSON and individual field formats
      let achievers = [];
      
      // First, try JSON format
      if (req.body['achievers[achievers]']) {
        try {
          const achieversData = JSON.parse(req.body['achievers[achievers]']);
          //console.log("Parsed achievers from JSON:", achieversData.length, "achievers");
          
          achievers = achieversData.map((achiever, index) => {
            const achieverItem = {
              name: achiever.name || '',
              achievement: achiever.achievement || '',
              category: achiever.category || 'student',
              year: achiever.year || '',
              order: parseInt(achiever.order) || index,
              isActive: achiever.isActive === true,
              images: []
            };

            // Handle multiple images for achiever
            const achieverFiles = files.filter(f => f.fieldname === `achievers[achievers][${index}][images]`);
            if (achieverFiles.length > 0) {
              achieverItem.images = achieverFiles.map(file => `/uploads/achievers/${file.filename}`);
            } else if (achiever.existingImages) {
              try {
                achieverItem.images = JSON.parse(achiever.existingImages);
              } catch (error) {
                console.error("Error parsing existing images for achiever:", error);
                achieverItem.images = [];
              }
            }

            return achieverItem;
          });
        } catch (error) {
          console.error("Error parsing achievers JSON:", error);
        }
      }
      
      // If no achievers found in JSON, try individual field format
      if (achievers.length === 0) {
        //console.log("Trying individual field format for achievers");
        let index = 0;
        while (req.body[`achievers[achievers][${index}][name]`]) {
          //console.log(`Found achiever ${index} (individual field):`, req.body[`achievers[achievers][${index}][name]`]);
          const achiever = {
            name: req.body[`achievers[achievers][${index}][name]`] || '',
            achievement: req.body[`achievers[achievers][${index}][achievement]`] || '',
            category: req.body[`achievers[achievers][${index}][category]`] || 'student',
            year: req.body[`achievers[achievers][${index}][year]`] || '',
            order: parseInt(req.body[`achievers[achievers][${index}][order]`]) || index,
            isActive: req.body[`achievers[achievers][${index}][isActive]`] === 'true',
            images: []
          };

          // Handle multiple images for achiever
          const achieverFiles = files.filter(f => f.fieldname === `achievers[achievers][${index}][images]`);
          if (achieverFiles.length > 0) {
            achiever.images = achieverFiles.map(file => `/uploads/achievers/${file.filename}`);
          } else if (req.body[`achievers[achievers][${index}][existingImages]`]) {
            try {
              achiever.images = JSON.parse(req.body[`achievers[achievers][${index}][existingImages]`]);
            } catch (error) {
              console.error("Error parsing existing images for achiever:", error);
              achiever.images = [];
            }
          }

          achievers.push(achiever);
          index++;
        }
      }

      homeContent.achievers.achievers = achievers;
      //console.log(`Processed ${homeContent.achievers.achievers.length} achievers`);
    }

    //console.log("Saving home content...");
    await homeContent.save();
    //console.log("Home content saved successfully!");

    // Redirect back to edit page
    res.redirect("/admin/home/edit");
  } catch (err) {
    console.error("Error updating home content:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
