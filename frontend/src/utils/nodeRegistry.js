export const getDynamicNodes = () => {
  try {
    const saved = localStorage.getItem('sf_dynamic_nodes');
    return saved ? JSON.parse(saved) : {};
  } catch (err) {
    console.error("Registry: Failed to load dynamic nodes.", err);
    return {};
  }
};

export const saveNewNode = (nodeDefinition) => {
  const dynamicNodes = getDynamicNodes();
  const nodeId = `custom_${Date.now()}`;
  dynamicNodes[nodeId] = {
    ...nodeDefinition,
    id: nodeId,
    isCustom: true,
    color: nodeDefinition.color || 'cyan',
    glow: nodeDefinition.glow || 'glow-active-cyan'
  };
  localStorage.setItem('sf_dynamic_nodes', JSON.stringify(dynamicNodes));
  window.dispatchEvent(new Event('sf_registry_updated'));
  return nodeId;
};

export const deleteDynamicNode = (nodeId) => {
  const dynamicNodes = getDynamicNodes();
  delete dynamicNodes[nodeId];
  localStorage.setItem('sf_dynamic_nodes', JSON.stringify(dynamicNodes));
  window.dispatchEvent(new Event('sf_registry_updated'));
};
