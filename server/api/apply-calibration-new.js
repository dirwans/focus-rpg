const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const sharp = require('sharp'); // For image processing

const router = express.Router();

// Middleware to handle multipart/form-data
router.use(express.raw({ type: 'image/png', limit: '50mb' }));
router.use(express.json());

// Path to the game repository
const REPO_PATH = '/var/www/focus-rpg';
const BACKUP_PATH = '/var/backups/focus-rpg';

// Helper function to generate commit message
function generateCommitMessage(job, tier) {
  const timestamp = new Date().toISOString();
  return `feat: Update ${job} calibration for tier ${tier} - ${timestamp}`;
}

// Helper function to create backup
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_PATH, `calibration-backup-${timestamp}.tar.gz`);

  try {
    await execPromise(`tar -czf ${backupFile} -C ${REPO_PATH} .`);
    console.log(`Backup created: ${backupFile}`);
    return backupFile;
  } catch (error) {
    console.error('Backup failed:', error);
    throw new Error(`Failed to create backup: ${error.message}`);
  }
}

// Helper function to write calibration data
async function writeCalibrationData(job, tier, coordinates) {
  try {
    const calibrationPath = path.join(REPO_PATH, 'src', 'components', 'ArctronGearOverlay.jsx');
    const calibrationContent = `// Auto-generated calibration data for ${job} tier ${tier}
// Generated at: ${new Date().toISOString()}
${coordinates}`;

    await fs.writeFile(calibrationPath, calibrationContent);
    console.log(`Calibration data written for ${job} tier ${tier}`);
    return true;
  } catch (error) {
    console.error('Failed to write calibration data:', error);
    throw new Error(`Failed to write calibration data: ${error.message}`);
  }
}

// Helper function to commit and push changes
async function commitAndPushChanges(message) {
  try {
    // Add files to git
    await execPromise(`cd ${REPO_PATH} && git add .`);

    // Commit changes
    await execPromise(`cd ${REPO_PATH} && git commit -m "${message}"`);

    // Push changes
    const { stdout: pushOutput } = await execPromise(`cd ${REPO_PATH} && git push origin main`);
    console.log('Changes pushed successfully');

    // Extract commit hash from push output
    const commitMatch = pushOutput.match(/[a-f0-9]{7,}/);
    const commitHash = commitMatch ? commitMatch[0] : 'unknown';

    return { success: true, commitHash };
  } catch (error) {
    console.error('Git operation failed:', error);
    throw new Error(`Git operation failed: ${error.message}`);
  }
}

// Main API endpoint
router.post('/', async (req, res) => {
  try {
    // Parse FormData
    const calibrationData = JSON.parse(req.body.calibrationData);
    const { job, tier, timestamp, coordinates } = calibrationData;

    // Validate input
    if (!job || !tier || !coordinates) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: job, tier, coordinates'
      });
    }

    console.log(`Received calibration request for ${job} tier ${tier}`);

    // Create backup before making changes
    const backupFile = await createBackup();

    // Create assets directory if it doesn't exist
    const assetsDir = path.join(REPO_PATH, 'assets', 'arctron', `${job}_armor_set_lv${tier}`);
    await fs.mkdir(assetsDir, { recursive: true });

    // Process each gear image
    const gearSlots = ['armor', 'pants', 'boots_l', 'boots_r', 'gloves_l', 'gloves_r', 'helmet', 'weapon', 'shield'];

    for (const slot of gearSlots) {
      const imageKey = `${slot}_image`;
      if (req.body[imageKey]) {
        const imageBuffer = req.body[imageKey];

        // Process image with sharp to optimize
        const processedImage = await sharp(imageBuffer)
          .png({ compressionLevel: 9 })
          .toBuffer();

        // Save processed image to assets directory
        const imagePath = path.join(assetsDir, `${slot}.png`);
        await fs.writeFile(imagePath, processedImage);

        console.log(`Saved calibrated ${slot} image to ${imagePath}`);
      }
    }

    // Write calibration data to the repository
    await writeCalibrationData(job, tier, coordinates);

    // Generate commit message
    const commitMessage = generateCommitMessage(job, tier);

    // Commit and push changes
    const gitResult = await commitAndPushChanges(commitMessage);

    // Return success response
    res.json({
      success: true,
      commitHash: gitResult.commitHash,
      deployStatus: 'pending',
      backupFile,
      timestamp,
      message: `Calibration for ${job} tier ${tier} applied successfully`
    });

  } catch (error) {
    console.error('Apply calibration failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
