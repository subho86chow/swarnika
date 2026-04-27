export default function ShippingPage() {
  return (
    <main className="pt-[72px]">
        {/* Hero */}
        <section className="pt-8 md:pt-10 pb-6 md:pb-8 px-6 md:px-14 lg:px-20">
          <div className="max-w-[1440px] mx-auto">
            <h1 className="font-headline text-3xl md:text-5xl text-navy italic">
              Shipping & Returns
            </h1>
            <p className="font-body text-outline text-sm mt-2">
              Customer care and support
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 px-6 md:px-14 lg:px-20 bg-ivory">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Shipping */}
            <div className="space-y-6">
              <h2 className="font-headline text-2xl text-navy flex items-center gap-3">
                <span className="material-symbols-outlined text-gold">local_shipping</span>
                Shipping Information
              </h2>
              <div className="space-y-4 text-slate-subtle text-sm leading-relaxed">
                <div className="bg-white border border-outline-light/30 p-5 space-y-3">
                  <h3 className="font-headline text-base text-navy">Domestic Shipping (India)</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2"><span className="text-gold mt-0.5">•</span>Free insured shipping on orders above ₹50,000</li>
                    <li className="flex items-start gap-2"><span className="text-gold mt-0.5">•</span>Standard delivery: 5–7 business days (₹999 for orders under ₹50,000)</li>
                    <li className="flex items-start gap-2"><span className="text-gold mt-0.5">•</span>Express delivery: 2–3 business days (₹1,999)</li>
                    <li className="flex items-start gap-2"><span className="text-gold mt-0.5">•</span>All shipments are fully insured and tracked</li>
                  </ul>
                </div>
                <div className="bg-white border border-outline-light/30 p-5 space-y-3">
                  <h3 className="font-headline text-base text-navy">Packaging</h3>
                  <p>Every SWARNIKA piece ships in our signature luxury packaging — a velvet-lined box nestled inside a branded gift bag with a certificate of authenticity.</p>
                </div>
              </div>
            </div>

            {/* Returns */}
            <div className="space-y-6">
              <h2 className="font-headline text-2xl text-navy flex items-center gap-3">
                <span className="material-symbols-outlined text-gold">refresh</span>
                Return Policy
              </h2>
              <div className="space-y-4 text-slate-subtle text-sm leading-relaxed">
                <div className="bg-white border border-outline-light/30 p-5 space-y-3">
                  <h3 className="font-headline text-base text-navy">30-Day Returns</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2"><span className="text-gold mt-0.5">•</span>Return any unworn piece within 30 days for a full refund</li>
                    <li className="flex items-start gap-2"><span className="text-gold mt-0.5">•</span>Items must be in original condition with tags attached</li>
                    <li className="flex items-start gap-2"><span className="text-gold mt-0.5">•</span>Return shipping is free for domestic orders</li>
                    <li className="flex items-start gap-2"><span className="text-gold mt-0.5">•</span>Refunds are processed within 5–7 business days</li>
                  </ul>
                </div>
                <div className="bg-white border border-outline-light/30 p-5 space-y-3">
                  <h3 className="font-headline text-base text-navy">Exchange Policy</h3>
                  <p>We offer free exchanges within 30 days of delivery. Contact our concierge team to arrange an exchange for a different piece or size.</p>
                </div>
                <div className="bg-white border border-outline-light/30 p-5 space-y-3">
                  <h3 className="font-headline text-base text-navy">Non-Returnable Items</h3>
                  <p>Custom/bespoke orders and personalized engravings are final sale and cannot be returned. Sale items may have modified return windows — check at checkout.</p>
                </div>
              </div>
            </div>

            {/* How to Return */}
            <div className="space-y-6">
              <h2 className="font-headline text-2xl text-navy flex items-center gap-3">
                <span className="material-symbols-outlined text-gold">help</span>
                How to Initiate a Return
              </h2>
              <div className="bg-white border border-outline-light/30 p-5 space-y-3 text-slate-subtle text-sm leading-relaxed">
                <ol className="space-y-3 list-decimal list-inside">
                  <li>Contact our team at <span className="text-navy font-medium">hello@swarnika.com</span> or call <span className="text-navy font-medium">+91 33 2249 XXXX</span></li>
                  <li>Provide your order number and reason for return</li>
                  <li>Receive a prepaid return label via email within 24 hours</li>
                  <li>Pack the item securely in its original SWARNIKA packaging</li>
                  <li>Drop off at any courier partner location or schedule a pickup</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
