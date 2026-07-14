import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generate a PDF report for a specific hair analysis.
 * @param {Object} analysis - The Analysis document object from MongoDB
 * @param {Object} user - The User document object
 * @returns {Promise<Buffer>} - Resolves with the PDF Buffer
 */
export const generateAnalysisPDF = (analysis, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Colors
      const primaryColor = '#7c3aed'; // violet-600
      const secondaryColor = '#06b6d4'; // cyan-500
      const darkColor = '#1f2937'; // gray-800
      const lightColor = '#f3f4f6'; // gray-100
      const warningColor = '#ef4444'; // red-500

      // Title & Header Section
      doc
        .fillColor(primaryColor)
        .fontSize(26)
        .text('HAIRSCOPE AI', 50, 50, { characterSpacing: 1 })
        .fontSize(10)
        .fillColor(secondaryColor)
        .text('CLINICAL HAIR LOSS ANALYSIS & NUTRITION REPORT', 50, 80)
        .moveDown();

      // Divider line
      doc
        .strokeColor(primaryColor)
        .lineWidth(2)
        .moveTo(50, 95)
        .lineTo(545, 95)
        .stroke();

      // Patient Info Section
      doc.moveDown(1.5);
      doc
        .fillColor(darkColor)
        .fontSize(14)
        .text('User Profile Information', 50, 110, { underline: true });

      doc.fontSize(10).fillColor('#4b5563');
      doc.text(`Name: ${user.name}`, 50, 135);
      doc.text(`Email: ${user.email}`, 50, 150);
      doc.text(`Age: ${user.age || 'N/A'}`, 50, 165);
      doc.text(`Gender: ${user.gender || 'N/A'}`, 50, 180);

      doc.text(`Country: ${user.country || 'N/A'}`, 300, 135);
      doc.text(`Hair Loss Start: ${user.hairLossStartYear || 'N/A'}`, 300, 150);
      doc.text(`Family History: ${user.familyHistory || 'N/A'}`, 300, 165);
      doc.text(`Report Date: ${new Date(analysis.createdAt).toLocaleDateString()}`, 300, 180);

      // Score Callout Box
      doc.rect(50, 205, 495, 80).fill(lightColor);

      doc.fillColor(primaryColor).fontSize(12).text('Hair Health Metrics', 70, 215, { bold: true });
      doc.fillColor(darkColor).fontSize(10);
      doc.text(`Norwood Stage: `, 70, 240).fillColor(warningColor).text(analysis.norwoodStage, 160, 240);
      doc.fillColor(darkColor).text(`Density Score: `, 70, 255).fillColor(secondaryColor).text(`${analysis.densityScore}/100`, 160, 255);
      doc.fillColor(darkColor).text(`Crown Thinning (Scalp): `, 300, 240).text(`${analysis.crownThinning}%`, 430, 240);
      doc.fillColor(darkColor).text(`Overall Health Score: `, 300, 255).fillColor(primaryColor).text(`${analysis.healthScore}/100`, 430, 255);

      // Reset text options
      doc.fillColor(darkColor).fontSize(10);

      // AI Analysis Summary
      doc.moveDown(7.5);
      doc.fontSize(14).fillColor(primaryColor).text('AI Diagnostic Recommendations', 50, doc.y);
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#374151');
      if (analysis.recommendations && analysis.recommendations.length > 0) {
        analysis.recommendations.forEach((rec, idx) => {
          doc.text(`${idx + 1}. ${rec}`, { indent: 15 });
          doc.moveDown(0.2);
        });
      } else {
        doc.text('No standard recommendations generated.', { indent: 15 });
      }

      // Nutrition Scores
      doc.moveDown(1.5);
      doc.fontSize(14).fillColor(primaryColor).text('Nutrition Performance Scores', 50, doc.y);
      doc.moveDown(0.5);

      const nutrition = analysis.nutritionRecommendations || {};
      doc.fontSize(10).fillColor('#374151');
      doc.text(`Protein Score: ${nutrition.proteinScore || 0}/100`);
      doc.text(`Iron Score: ${nutrition.ironScore || 0}/100`);
      doc.text(`Zinc Score: ${nutrition.zincScore || 0}/100`);
      doc.text(`Vitamin Score: ${nutrition.vitaminScore || 0}/100`);
      doc.fillColor(secondaryColor).text(`Overall Diet Quality Score: ${nutrition.nutritionScore || 0}/100`, { bold: true });

      // Add a page for the Meal Plan
      doc.addPage();

      // Meal Plan Header
      doc
        .fillColor(primaryColor)
        .fontSize(18)
        .text('Weekly Hair Growth Meal Plan', 50, 50)
        .fontSize(9)
        .fillColor('#6b7280')
        .text('Custom-tailored based on dietary choices and hair metrics', 50, 75)
        .moveDown();

      doc.strokeColor(primaryColor).lineWidth(1).moveTo(50, 88).lineTo(545, 88).stroke();
      doc.moveDown(1);

      // Render Meal Plan
      if (nutrition.weeklyMealPlan) {
        let currentY = 100;
        // Check map values
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach((day) => {
          // Check if day exists in weeklyMealPlan Map or Object
          let plan = nutrition.weeklyMealPlan instanceof Map 
            ? nutrition.weeklyMealPlan.get(day.toLowerCase()) 
            : nutrition.weeklyMealPlan[day.toLowerCase()];

          if (!plan) {
            plan = { breakfast: 'N/A', lunch: 'N/A', dinner: 'N/A', snacks: 'N/A' };
          }

          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }

          doc.fillColor(primaryColor).fontSize(11).text(day, 50, currentY, { bold: true });
          doc.fillColor(darkColor).fontSize(9);
          doc.text(`Breakfast: ${plan.breakfast}`, 70, currentY + 15, { width: 450 });
          doc.text(`Lunch: ${plan.lunch}`, 70, currentY + 30, { width: 450 });
          doc.text(`Dinner: ${plan.dinner}`, 70, currentY + 45, { width: 450 });
          doc.text(`Snack: ${plan.snacks}`, 70, currentY + 60, { width: 450 });

          currentY += 80;
        });
      }

      // Disclaimer on footer of all pages
      const disclaimer = 'Disclaimer: This application is not a medical diagnostic tool. Recommendations and plans generated here are designed to support cosmetic hair health and overall nutrition. Please consult with a board-certified dermatologist or healthcare provider before starting any medical treatments.';
      
      let pages = doc._path.length; // Approximate way to check pages in PDFKit, but better to draw during pageAdded
      // Let's write disclaimer at the bottom of the current page
      doc.moveDown(2);
      doc
        .fontSize(7)
        .fillColor('#9ca3af')
        .text(disclaimer, 50, 750, { width: 495, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
