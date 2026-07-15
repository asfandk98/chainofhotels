import Reveal from "./Reveal";

const features = [
  {
    icon: "hotel",
    title: "Premium Hotel Collection",
    description:
      "Discover carefully selected luxury, business, and family-friendly hotels across the UAE, offering exceptional comfort and service.",
  },
  {
    icon: "verified",
    title: "Best Price Guarantee",
    description:
      "Enjoy competitive room rates with transparent pricing and no hidden booking fees.",
  },
  {
    icon: "support_agent",
    title: "24/7 Guest Support",
    description:
      "Our dedicated hospitality team is available around the clock to assist before, during, and after your stay.",
  },
  {
    icon: "star",
    title: "Trusted Guest Experience",
    description:
      "Experience outstanding hospitality with highly rated hotels, premium amenities, and personalized service.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-surface-container py-section-gap px-container-padding-mobile md:px-container-padding-desktop overflow-hidden">
      <Reveal className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
        <span className="font-label-caps text-secondary mb-4 block">
  WHY CHOOSE US
</span>

<h3 className="font-headline-lg-mobile md:font-headline-lg mb-8">
  Experience Comfort, Luxury & Exceptional Hospitality
</h3>

<p className="font-body-lg text-on-surface-variant mb-12">
  Whether you're traveling for business, leisure, or a family vacation, our
  collection of premium hotels offers world-class comfort, modern amenities,
  and outstanding service to make every stay memorable.
</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-secondary/10 flex items-center justify-center text-secondary rounded-lg">
                  <span className="material-symbols-outlined">
                    {feature.icon}
                  </span>
                </div>
                <div>
                  <h5 className="font-title-md mb-2">{feature.title}</h5>
                  <p className="font-body-md text-on-surface-variant text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[600px] hidden lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center rounded-2xl shadow-2xl"
            role="img"
            aria-label="A sleek gold-trimmed Rolls Royce parked in front of a modern Dubai villa at sunset with the Burj Khalifa silhouette in the background."
            style={{
              backgroundImage:
  "url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80')",
            }}
          />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary p-8 rounded-2xl flex flex-col justify-center items-center text-on-secondary text-center">
           <span className="font-display-lg text-4xl">100+</span>
<span className="font-label-caps text-[10px]">
  PREMIUM HOTELS
</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
