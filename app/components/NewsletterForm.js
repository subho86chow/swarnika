"use client";

export default function NewsletterForm() {
  return (
    <form
      className="flex flex-col sm:flex-row items-stretch gap-0 w-full"
      onSubmit={(e) => {
        e.preventDefault();
        alert("Thank you for joining The Archive.");
      }}
    >
      <input
        type="email"
        placeholder="Your email address"
        className="subscribe-input w-full sm:flex-1 bg-white/5 border border-white/20 text-white px-5 py-4 font-body text-[13px] placeholder:text-white/40 focus:outline-none focus:border-gold-light transition-colors"
        required
      />
      <button
        type="submit"
        className="subscribe-btn px-8 py-4 sm:py-0"
      >
        Subscribe
      </button>
    </form>
  );
}
