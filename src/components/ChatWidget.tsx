import { useEffect } from 'react';

const ChatWidget = () => {
  useEffect(() => {
    // Create and inject the chat widget script
    const script = document.createElement('script');
    script.src = 'https://widgets.leadconnectorhq.com/loader.js';
    script.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js');
    script.setAttribute('data-widget-id', '68e17cb0f6690c7c0acdd94f');
    script.async = true;
    
    document.body.appendChild(script);
    
    // Cleanup function to remove the script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default ChatWidget;
