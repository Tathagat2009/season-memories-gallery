const cards = [
  {
    title: "Diplomacy in Action",
    body: "Engage in intense debate across diverse committees that simulate real United Nations forums.",
  },
  {
    title: "World-Class Committees",
    body: "From UNSC to UNHRC, immerse yourself in pressing global agendas with expert chairs.",
  },
  {
    title: "A Journey, Not an Event",
    body: "Build lifelong skills in negotiation, public speaking, and leadership across two unforgettable days.",
  },
];

const InfoCards = () => {
  return (
    <section id="about" className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
      <h2 className="text-white text-3xl md:text-5xl font-bold text-center mb-14">
        Welcome to Season 2
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="glass rounded-2xl p-7 hover:bg-white/10 transition-all hover:-translate-y-1"
          >
            <h3 className="text-white text-xl font-semibold mb-3">{c.title}</h3>
            <p className="text-white/80 leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InfoCards;
