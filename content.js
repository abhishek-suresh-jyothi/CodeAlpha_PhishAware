// content.js — all training lessons and the 15 quiz questions live here.
// You can edit the text safely. Keep the structure the same.

export const MODULES = [
  {
    id: 1, icon: "🎣", title: "Introduction to Phishing",
    intro: [
      "Phishing is a cyber attack where a criminal pretends to be someone you trust (a bank, a delivery company, your employer, a friend) to trick you into revealing sensitive information or doing something harmful. The word sounds like “fishing”: attackers throw out bait and wait for someone to bite.",
      "How it works: (1) the attacker builds a convincing message, (2) sends it to many people or to one chosen target, (3) the message pushes you to click a link, open a file or reply, (4) a fake page or file steals your data or installs malware, (5) the attacker uses what they stole for fraud or sells it.",
      "Why attackers use it: it is cheap, it scales to millions of people, and it targets human behaviour instead of technical defences. One careless click can give an attacker access to money, accounts or a whole company network."
    ],
    points: [
      "Phishing attacks the person, not the computer.",
      "Common warning signs: urgency, threats, unexpected requests, mismatched links, odd sender addresses and requests for passwords or codes.",
      "Anyone can be targeted. Awareness is the best defence."
    ],
    example: { title: "Example", body: "You receive a text: “Your parcel is on hold. Pay a small fee here to release it.” You were not expecting a parcel, and the link is not the courier's real website. This is a phishing attempt." },
    tip: "Pause before you act. Real organisations rarely demand instant action through a link."
  }, 
  {
    id: 2, icon: "🧩", title: "Types of Phishing",
    intro: [
      "Phishing comes in many forms. Knowing the names helps you recognise the tricks. Email phishing is the classic mass message. Spear phishing is aimed at one person and uses personal details (your name, job, colleagues) to look genuine. Whaling targets senior executives with high-value requests.",
      "Smishing uses SMS text messages. Vishing uses phone calls or voicemails. Clone phishing copies a real email you already received and swaps the link or attachment for a malicious one. Business Email Compromise (BEC) impersonates a boss or supplier to request payments or changes to bank details.",
      "QR-code phishing (“quishing”) hides a malicious link inside a QR code on a poster, sticker or email. You cannot see the real address before scanning, which is why it works."
    ],
    points: [
      "Email phishing: mass messages. Spear phishing: targeted. Whaling: executives.",
      "Smishing: SMS. Vishing: voice calls. Clone phishing: a copied, tampered real email.",
      "BEC: fake instructions to move money. Quishing: malicious QR codes."
    ],
    example: { title: "Example (BEC)", body: "An accountant gets an email that looks like it is from the CEO: “I'm in a meeting. Urgently transfer funds to this new supplier account. Keep it confidential.” The tone, secrecy and urgency are red flags. Verify by calling the CEO on a known number." },
    tip: "The more personal or urgent a message feels, the more carefully you should verify it."
  },
  {
    id: 3, icon: "📧", title: "Recognizing Phishing Emails",
    intro: [
      "Start with the sender. Look at the full email address, not just the display name. Attackers use look-alike domains such as “support@paypa1.com” or add extra words like “bank-secure-help.com”.",
      "Check the language. Phishing emails create urgency (“act within 24 hours”), fear (“your account will be closed”) or excitement (“you won a prize”). They often contain unexpected attachments, generic greetings such as “Dear customer”, and requests for passwords, card numbers or one-time codes.",
      "Check links by hovering over them (or long-pressing on mobile) to see the real destination. Grammar and spelling mistakes can be a clue, but modern phishing, even AI-written, can be flawless, so never rely on spelling alone."
    ],
    points: [
      "Suspicious sender address or mismatched reply-to.",
      "Urgent or threatening language.",
      "Unexpected attachments (.zip, .exe, .html, macro-enabled Office files).",
      "Links whose real destination does not match the text.",
      "Requests for passwords, PINs, card details or OTPs.",
      "Unusual grammar, tone or formatting."
    ],
    example: { title: "Example", body: "From: “Microsoft Support” <helpdesk@micros0ft-alerts.example>. Subject: “Your mailbox is full — verify now”. The domain uses a zero instead of the letter “o”, and legitimate providers do not ask you to verify through a link." },
    tip: "No legitimate company will ask for your password by email. Ever."
  },
  {
    id: 4, icon: "🌐", title: "Fake Websites and URLs",
    intro: [
      "A URL has parts. In “https://login.example.com/account”, the important part is the domain “example.com” (the text just before the first single slash, ignoring subdomains). Attackers abuse subdomains: “example.com.secure-login.net” actually belongs to “secure-login.net”.",
      "Domain impersonation includes typosquatting (examp1e.com), extra words (example-support.com), different endings (.co instead of .com) and look-alike characters. Fake login pages copy a brand's design perfectly, so the page looks genuine while the address is wrong.",
      "A padlock and HTTPS only mean the connection is encrypted. Criminals can get HTTPS certificates too, so a padlock does NOT prove a site is safe or honest."
    ],
    points: [
      "Read the domain from right to left up to the first single slash.",
      "HTTPS = encrypted connection, not a guarantee of trust.",
      "Type the address yourself or use a saved bookmark for banks and important accounts.",
      "Be cautious of shortened links; preview them before opening."
    ],
    example: { title: "Example", body: "https://examplebank.com.account-verify.net/login looks like “examplebank.com”, but the real domain is account-verify.net. Do not enter any details." },
    tip: "For important accounts, use the official app or a bookmark instead of clicking links in messages."
  },
  {
    id: 5, icon: "🧠", title: "Social Engineering",
    intro: [
      "Social engineering is the art of manipulating people instead of hacking machines. Phishing is one form; others include phone scams and in-person tricks such as tailgating through a secure door.",
      "Attackers use predictable psychological levers: impersonation (pretending to be IT, a bank or police), urgency and fear (“your account is compromised”), authority (“this is the CEO”), helpfulness (“can you help me quickly?”), and rewards (“you've won”).",
      "Their goal is to make you act before you think and to share confidential information such as passwords, OTPs, card numbers or internal details."
    ],
    points: [
      "If you feel rushed, scared or flattered, slow down.",
      "Verify identity through a separate, official channel.",
      "Never share passwords or OTPs with anyone, including “support staff”.",
      "It is okay to say no, hang up, or ask a colleague."
    ],
    example: { title: "Example", body: "A caller says: “I'm from IT. Your account was hacked. Read me the code we just texted you so I can secure it.” That code is the key to your account. Real IT will never ask for it." },
    tip: "Attackers rely on pressure. A calm pause is your strongest defence."
  },
  {
    id: 6, icon: "📡", title: "Phishing Through Different Channels",
    intro: [
      "Phishing is not limited to email. Email: fake invoices, password alerts. SMS: fake deliveries, bank alerts, toll fees. Phone calls: fake bank, tax or tech support callers, sometimes with spoofed caller ID.",
      "Social media: fake giveaways, cloned profiles of friends, job offers and direct messages with links. Messaging apps such as WhatsApp or Telegram: “Hi, is this you in this video?” links, fake support groups, or a hijacked friend's account asking for money.",
      "QR codes: stickers over real parking or restaurant QR codes, or QR codes in emails meant to bypass link scanners. The channel changes, but the tricks (urgency, impersonation, a link or request for data) stay the same."
    ],
    points: [
      "Caller ID and display names can be faked.",
      "A message from a friend's account may come from a hijacked account. Confirm by another channel.",
      "Treat QR codes like links. Check the preview URL before opening.",
      "Official organisations do not ask for passwords or OTPs on any channel."
    ],
    example: { title: "Example", body: "A QR sticker on a parking meter asks you to “scan to pay”. It could be pasted over the real one. Use the official parking app instead." },
    tip: "If a message arrives through an unexpected channel, treat it with extra suspicion."
  },
  {
    id: 7, icon: "🔐", title: "Password and Account Security",
    intro: [
      "A strong password is long (12+ characters, ideally a passphrase of several random words), unique for every account, and not based on personal information such as birthdays or pet names.",
      "A password manager creates and remembers unique passwords for you, and many warn you if you are on a fake site because the saved login will not auto-fill. Multi-factor authentication (MFA) adds a second proof, such as an authenticator app, security key or code, so a stolen password alone is not enough. Prefer authenticator apps or security keys over SMS codes when possible.",
      "Password reuse is dangerous: when one site is breached, attackers try the same email and password on other sites (credential stuffing). Keep account recovery options (backup email, phone) up to date and secure, because attackers target them too."
    ],
    points: [
      "Long, unique password for every account.",
      "Use a reputable password manager.",
      "Turn on MFA everywhere it is offered.",
      "Never reuse passwords between accounts.",
      "Keep recovery email and phone current."
    ],
    example: { title: "Example", body: "“Maple-Tiger-Rocket-Sunrise-42” is a long, memorable passphrase. “Rahul1990!” is short, guessable and easy to crack." },
    tip: "MFA blocks the vast majority of automated account takeovers. Turn it on today."
  },
  {
    id: 8, icon: "🛡️", title: "Safe Online Practices",
    intro: [
      "Verify before you trust. If a message asks for money, data or urgent action, confirm it using a different, official route: type the website yourself, use the official app, or call the number printed on your card or on the organisation's real website. Do not use phone numbers or links provided in the suspicious message.",
      "Avoid opening unexpected attachments, especially archives, executables and Office files asking you to “enable macros” or “enable content”. Keep your devices, browser and apps updated, and use security software.",
      "Report suspicious emails to your IT or security team, or use your email provider's “Report phishing” button. Reporting protects others. Share as little personal information as possible online, because attackers use it to make spear phishing convincing."
    ],
    points: [
      "Verify through official channels you find yourself.",
      "Do not open unexpected attachments or enable macros.",
      "Report suspicious messages.",
      "Limit personal details on public profiles.",
      "Keep software updated."
    ],
    example: { title: "Example", body: "Your “bank” texts about a blocked card. Instead of tapping the link, you open the bank's app or call the number on the back of your card to check." },
    tip: "When in doubt, go to the official source yourself. Never use the links provided."
  },
  {
    id: 9, icon: "🚨", title: "What to Do After a Phishing Attempt",
    intro: [
      "If you only received a suspicious message and did nothing, do not reply or click. Report it and delete it. If you clicked or entered information, act quickly and calmly: mistakes happen to everyone, and speed limits the damage.",
      "Steps: (1) Disconnect the device from the network if you opened a suspicious file or think malware may be running. (2) From a different, trusted device, change the passwords of any accounts you entered, and any account using the same password. (3) Turn on or review MFA and sign out other sessions. (4) Contact your bank, the organisation involved or your IT team. (5) Report the incident (IT/security team, email provider, or your country's cybercrime reporting portal).",
      "Then follow the organisation's official account-recovery steps, monitor your accounts and statements for unusual activity, and run a security scan on the affected device."
    ],
    points: [
      "Act quickly, don't panic and don't hide it.",
      "Change passwords from a trusted device.",
      "Tell your IT team, bank or the affected organisation.",
      "Report the incident.",
      "Monitor accounts for suspicious activity."
    ],
    example: { title: "Example", body: "You typed your email password into a fake page. You immediately change it from your phone, enable MFA, sign out all sessions, and notify your IT team. Fast action stops the attacker." },
    tip: "Reporting quickly is a sign of good security awareness, not a failure."
  },
  {
    id: 10, icon: "🔎", title: "Realistic Phishing Awareness Examples",
    intro: [
      "Below are clearly labelled educational examples. They are fictional and use fake domains that end in “.example”. For each one, look for the warning signs first, then compare with the explanation and the safe action."
    ],
    points: [
      "Always check sender, link, tone and request.",
      "Ask yourself: Was I expecting this? What does it want me to do? Is it rushing me?"
    ],
    examples: [
      {
        label: "Fake delivery text (Smishing)",
        from: "SMS from +00 000 000 000",
        subject: "",
        body: "Your package could not be delivered. Pay a ₹25 redelivery fee within 12 hours: http://courier-redelivery.example/pay",
        flags: ["Unknown number", "Urgent deadline", "Payment request via link", "Unofficial domain"],
        action: "Do not tap the link. Check the real courier app or website by typing the address yourself. Delete the message and report it."
      },
      {
        label: "Fake account alert (Email phishing)",
        from: "Security Team <alert@acc0unt-secure.example>",
        subject: "Unusual sign-in detected — verify within 1 hour",
        body: "Dear Customer, we noticed a sign-in from a new device. Click here to confirm your password or your account will be suspended.",
        flags: ["Look-alike domain (zero instead of “o”)", "Generic greeting", "Threat of suspension", "Asks to confirm your password"],
        action: "Do not click. Open the official website or app yourself, check for alerts, and report the email as phishing."
      },
      {
        label: "Fake boss request (BEC / spear phishing)",
        from: "“CEO Name” <ceo.office@company-mail.example>",
        subject: "Quick favour — confidential",
        body: "I'm travelling and can't talk. Please buy 5 gift cards and send me the codes today. I will reimburse you. Don't tell anyone yet.",
        flags: ["Authority pressure", "Secrecy", "Unusual request (gift cards)", "External look-alike address"],
        action: "Do not reply with codes. Contact the person via a known phone number or in person, and notify your IT/security team."
      }
    ],
    tip: "Run the same four checks on every suspicious message: sender, link, urgency and request."
  }
];

// ---- 15 final quiz questions (correct = index of the right option, 0-3) ----
export const QUESTIONS = [
  { q: "What is phishing?", o: ["A hardware failure that deletes files", "Tricking people by pretending to be a trusted source to steal information or cause harm", "A type of antivirus scan", "A way of speeding up your internet"], c: 1, e: "Phishing is social-engineering fraud: attackers impersonate trusted sources to steal data or push you into harmful actions." },
  { q: "How does spear phishing differ from regular email phishing?", o: ["It is sent only by phone", "It is aimed at a specific person or organisation using personal details", "It never includes links", "It only targets children"], c: 1, e: "Spear phishing is targeted and personalised, which makes it more convincing than mass emails." },
  { q: "Whaling attacks mainly target which group?", o: ["Senior executives and high-value individuals", "Students", "Anyone without a smartphone", "Antivirus vendors"], c: 0, e: "Whaling aims at “big fish” such as executives who can approve payments or access sensitive data." },
  { q: "Smishing is phishing carried out through…", o: ["Voice calls", "SMS text messages", "USB drives", "Printed letters"], c: 1, e: "Smishing = SMS phishing. Vishing = voice phishing." },
  { q: "An email comes from “support@paypa1-help.example”. What is the clearest warning sign?", o: ["It has a greeting", "The domain imitates a real brand using a number “1” instead of “l”", "It was sent in the morning", "It is short"], c: 1, e: "Look-alike domains are a classic trick. Always read the sender's actual address carefully." },
  { q: "A message says “Act within 1 hour or your account will be deleted!” What should you do?", o: ["Click quickly to save your account", "Reply with your password", "Do not click; check your account through the official website or app", "Forward it to all your contacts"], c: 2, e: "Artificial urgency is a pressure tactic. Verify using an official channel you open yourself." },
  { q: "What does the padlock/HTTPS in the browser mean?", o: ["The website is guaranteed to be safe", "The connection is encrypted, but the site could still be fake", "The site is run by a government", "The site has no ads"], c: 1, e: "HTTPS protects data in transit. Criminals can use HTTPS too, so always check the domain." },
  { q: "For a bank whose real domain is examplebank.com, which address is genuinely part of that domain?", o: ["examplebank.com.login-verify.net", "secure.examplebank.com", "examplebank-support.com", "examplebank.com@verify-now.biz"], c: 1, e: "Only secure.examplebank.com ends with the real domain examplebank.com. The others are tricks." },
  { q: "Social engineering mainly exploits…", o: ["Software bugs only", "Human psychology such as trust, fear, urgency and authority", "Slow internet", "Old keyboards"], c: 1, e: "It manipulates people into giving access or information instead of breaking technology." },
  { q: "A caller claims to be from your bank and asks you to read out the OTP just sent to you. What is the right response?", o: ["Read it out; they are your bank", "Give half of the code", "Hang up and call the bank's official number; never share OTPs", "Ask them to send it by email"], c: 2, e: "OTPs are for you only. This is vishing. Banks never ask for them." },
  { q: "You see a QR code sticker on a public meter asking you to scan and pay a “fee”. What is the main risk?", o: ["It may be pasted over the real code and lead to a fake payment site", "QR codes are always safe", "It will drain your battery", "It only works offline"], c: 0, e: "Attackers replace real QR codes with malicious ones. Use the official app or verify the link first." },
  { q: "Which gives the strongest protection for an important account?", o: ["A short password you can remember", "The same password everywhere", "A long unique password plus multi-factor authentication", "Sharing the password with a friend for backup"], c: 2, e: "Unique long passwords plus MFA stop most account takeovers." },
  { q: "Why is reusing the same password on several sites dangerous?", o: ["It makes websites slower", "If one site is breached, attackers can try it on your other accounts", "Passwords expire faster", "It is only a problem on mobile"], c: 1, e: "Credential stuffing reuses leaked passwords on other services." },
  { q: "You receive a suspicious email at work. What is the best action?", o: ["Forward it to all colleagues as a warning", "Open the attachment to check it", "Report it to IT/security using the official method and do not interact with it", "Reply asking if it is real"], c: 2, e: "Reporting helps protect everyone. Don't open, reply or forward it around." },
  { q: "You entered your password on a page you now think is fake. What should you do first?", o: ["Do nothing and hope it is fine", "Change the password from a trusted device, enable MFA and notify the organisation/IT", "Delete your browser", "Post about it on social media"], c: 1, e: "Fast action from a trusted device limits damage. Also change reused passwords and report the incident." }
];