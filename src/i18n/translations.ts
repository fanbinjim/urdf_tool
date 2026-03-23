export type Language = 'zh' | 'en';

export interface Translations {
  header: {
    title: string;
  };
  inputMode: {
    file: string;
    text: string;
  };
  fileUploader: {
    title: string;
    dragDrop: string;
    browse: string;
    supports: string;
    dropFile: string;
  };
  textEditor: {
    title: string;
    format: string;
    export: string;
    clear: string;
    loadURDF: string;
    fullScreen: string;
    close: string;
    save: string;
    undo: string;
    saveSuccess: string;
    xmlValid: string;
    xmlInvalid: string;
  };
  controlPanel: {
    title: string;
    resetJoints: string;
    loadURDF: string;
    noMovableJoints: string;
  };
  infoPanel: {
    title: string;
    loadURDF: string;
    links: string;
    joints: string;
    rootLink: string;
    structure: string;
    expandAll: string;
    collapseAll: string;
    details: string;
    name: string;
    type: string;
    parent: string;
    child: string;
    range: string;
    mass: string;
    visuals: string;
  };
  alerts: {
    fileFormatError: string;
    parseError: string;
    unsavedChanges: string;
  };
}

export const translations: Record<Language, Translations> = {
  zh: {
    header: {
      title: 'URDF 可视化工具',
    },
    inputMode: {
      file: '文件上传',
      text: '文本编辑',
    },
    fileUploader: {
      title: '文件上传',
      dragDrop: '拖拽URDF文件到这里，或',
      browse: '浏览',
      supports: '支持 .urdf, .xml 和 .zip 文件',
      dropFile: '将URDF文件拖放到此处',
    },
    textEditor: {
      title: 'URDF 编辑器',
      format: '格式化',
      export: '导出',
      clear: '清除',
      loadURDF: '加载 URDF',
      fullScreen: '全屏编辑',
      close: '关闭',
      save: '保存',
      undo: '撤销',
      saveSuccess: '保存成功！URDF已更新',
      xmlValid: '✓ XML 格式有效',
      xmlInvalid: '✗ XML 格式无效',
    },
    controlPanel: {
      title: '控制面板',
      resetJoints: '重置关节',
      loadURDF: '加载URDF文件以控制关节',
      noMovableJoints: '未找到可移动关节',
    },
    infoPanel: {
      title: '机器人信息',
      loadURDF: '加载URDF文件以查看机器人信息',
      links: '链接:',
      joints: '关节:',
      rootLink: '根链接:',
      structure: '结构',
      expandAll: '展开',
      collapseAll: '收缩',
      details: '详情',
      name: '名称:',
      type: '类型:',
      parent: '父级:',
      child: '子级:',
      range: '范围:',
      mass: '质量:',
      visuals: '视觉元素:',
    },
    alerts: {
      fileFormatError: '文件格式错误：无法解析URDF文件，请检查文件格式是否正确。',
      parseError: '解析失败：请检查XML格式。',
      unsavedChanges: '您有未保存的修改，确定要关闭吗？',
    },
  },
  en: {
    header: {
      title: 'URDF Visualization Tool',
    },
    inputMode: {
      file: 'File Upload',
      text: 'Text Editor',
    },
    fileUploader: {
      title: 'File Upload',
      dragDrop: 'Drag and drop a URDF file here, or',
      browse: 'browse',
      supports: 'Supports .urdf, .xml, and .zip files',
      dropFile: 'Drop the URDF file here',
    },
    textEditor: {
      title: 'URDF Editor',
      format: 'Format',
      export: 'Export',
      clear: 'Clear',
      loadURDF: 'Load URDF',
      fullScreen: 'Full Screen',
      close: 'Close',
      save: 'Save',
      undo: 'Undo',
      saveSuccess: 'Saved successfully! URDF updated',
      xmlValid: '✓ XML format is valid',
      xmlInvalid: '✗ XML format is invalid',
    },
    controlPanel: {
      title: 'Control Panel',
      resetJoints: 'Reset Joints',
      loadURDF: 'Load a URDF file to control joints',
      noMovableJoints: 'No movable joints found',
    },
    infoPanel: {
      title: 'Robot Info',
      loadURDF: 'Load a URDF file to see robot info',
      links: 'Links:',
      joints: 'Joints:',
      rootLink: 'Root Link:',
      structure: 'Structure',
      expandAll: 'Expand',
      collapseAll: 'Collapse',
      details: 'Details',
      name: 'Name:',
      type: 'Type:',
      parent: 'Parent:',
      child: 'Child:',
      range: 'Range:',
      mass: 'Mass:',
      visuals: 'Visuals:',
    },
    alerts: {
      fileFormatError: 'File format error: Unable to parse URDF file. Please check the file format.',
      parseError: 'Failed to parse URDF content. Please check the XML format.',
      unsavedChanges: 'You have unsaved changes. Are you sure you want to close?',
    },
  },
};
