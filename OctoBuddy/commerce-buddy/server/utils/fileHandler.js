const fs = require('fs/promises');
const path = require('path');
const os = require('os');

// Read File
export const readFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    
    return data;
  } catch (error) {
    console.error('Error reading file:', error);
  }
};

// Write File
export const writeFile = async (filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    console.log('File written successfully.');
  } catch (error) {
    console.error('Error writing file:', error);
  }
};

// Append to File
export const appendToFile = async (filePath, content) => {
  try {
    await fs.appendFile(filePath, content, 'utf-8');
    console.log('Content appended successfully.');
  } catch (error) {
    console.error('Error appending to file:', error);
  }
};

// Delete File
export const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log('File deleted successfully.');
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};


// Rename File
export const renameFile = async (oldPath, newPath) => {
  try {
    await fs.rename(oldPath, newPath);
    console.log('File renamed successfully.');
  } catch (error) {
    console.error('Error renaming file:', error);
  }
};