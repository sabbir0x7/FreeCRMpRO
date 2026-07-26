import { MessageCircle, Mail, Globe, Phone, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";

export function ContactMe() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center gap-6 glass-surface rounded-2xl border border-white/10 dark:border-white/5 p-6 shadow-lg">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-brand to-brand/60 bg-clip-text text-transparent">Let's Build Something Great!</h1>
          <p className="text-lg text-muted-foreground">
            I'm a passionate developer ready to help you take your project to the next level. Whether you need a custom SaaS, a stunning UI redesign, or a complex web application, I'm here to help.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <Button className="bg-[#25D366] text-white hover:bg-[#20bd5a] border-none shadow-md" onClick={() => window.open('https://wa.me/YOUR_PHONE_NUMBER', '_blank')}>
              <Phone className="mr-2 size-4" /> WhatsApp
            </Button>
            <Button className="bg-[#1dbf73] text-white hover:bg-[#19a463] border-none shadow-md" onClick={() => window.open('https://www.fiverr.com/sabbir0x7', '_blank')}>
              <ExternalLink className="mr-2 size-4" /> Hire me on Fiverr
            </Button>
            <Button variant="outline" className="border-white/20 dark:border-white/10 shadow-sm" onClick={() => window.open('mailto:your.email@example.com', '_blank')}>
              <Mail className="mr-2 size-4" /> Email Me
            </Button>
          </div>
        </div>
        <div className="w-full md:w-1/2 rounded-xl overflow-hidden border border-white/10 dark:border-white/5 shadow-xl relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
          <img 
            src="/src/assets/images/fiverr-promo-banner.png" 
            alt="Promotional Banner" 
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-surface rounded-xl border border-white/10 dark:border-white/5 p-5 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10 border border-brand/20 text-brand mb-4">
            <Globe className="size-6" />
          </div>
          <h3 className="font-semibold mb-2">Portfolio</h3>
          <p className="text-sm text-muted-foreground mb-4">Check out my recent projects and case studies.</p>
          <Button variant="link" className="text-brand p-0">View Portfolio &rarr;</Button>
        </div>
        
        <div className="glass-surface rounded-xl border border-white/10 dark:border-white/5 p-5 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#1dbf73]/10 border border-[#1dbf73]/20 text-[#1dbf73] mb-4">
            <ExternalLink className="size-6" />
          </div>
          <h3 className="font-semibold mb-2">Fiverr Services</h3>
          <p className="text-sm text-muted-foreground mb-4">Top-rated services for web development and design.</p>
          <Button variant="link" className="text-[#1dbf73] p-0" onClick={() => window.open('https://www.fiverr.com/sabbir0x7', '_blank')}>Explore Gigs &rarr;</Button>
        </div>
        
        <div className="glass-surface rounded-xl border border-white/10 dark:border-white/5 p-5 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] mb-4">
            <MessageCircle className="size-6" />
          </div>
          <h3 className="font-semibold mb-2">Quick Chat</h3>
          <p className="text-sm text-muted-foreground mb-4">Have a quick question? Message me on WhatsApp.</p>
          <Button variant="link" className="text-[#25D366] p-0" onClick={() => window.open('https://wa.me/YOUR_PHONE_NUMBER', '_blank')}>Send Message &rarr;</Button>
        </div>
      </div>
    </div>
  );
}
