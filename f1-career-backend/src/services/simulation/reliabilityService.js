// src/services/simulation/reliabilityService.js

exports.checkMechanicalFailure = (teamPerformanceLevel = 1) => {
  const baseFailureRate = 0.05; // 5%
  const modifier = 0.02 * teamPerformanceLevel;

  const probability = baseFailureRate - modifier;

  return Math.random() < probability;
};