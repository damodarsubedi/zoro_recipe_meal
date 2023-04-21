function toggleDarkMode(e) {
  if (e.target.checked) {
    $('body').addClass('dark-mode');
    saveToLocalStorage('theme', 'dark');
  } else {
    $('body').removeClass('dark-mode');
    saveToLocalStorage('theme', 'light');
  }
}
const setThemePreference = () => {
    // light/dark theme toggle
    const themeToggle = $('.theme-switch input[type="checkbox"]');
    const themePreference = loadFromLocalStorage('theme');
  
    themeToggle.on('change', toggleDarkMode);
  
    if (themePreference === 'dark') {
      $('body').addClass('dark-mode');
      themeToggle.prop('checked', true);
    }
};

function toggleThemeMode() {
    const themeToggle = $('.theme-switch input[type="checkbox"]');
    
    function toggleDarkMode() {
      if (themeToggle.prop('checked')) {
        $('body').addClass('dark-mode');
        saveToLocalStorage('theme', 'dark');
      } else {
        $('body').removeClass('dark-mode');
        saveToLocalStorage('theme', 'light');
      }
    }
    
    themeToggle.on('change', toggleDarkMode);
    
    if (loadFromLocalStorage('theme') === 'dark') {
      $('body').addClass('dark-mode');
      themeToggle.prop('checked', true);
    }
}

$(document).ready(function() {
  setThemePreference();
});