import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core';

export interface FaqItem { q: string; a: string; }

@Component({
  selector: 'app-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './faq.html',
})
export class FaqComponent {
  open = signal<number | null>(0);
  toggle(i: number) { this.open.update((cur) => (cur === i ? null : i)); }

  @Input() items: FaqItem[] = [
    {
      q: 'What age is Masroofi for?',
      a: 'Masroofi is designed for kids and teens aged 6 to 18. Parents stay in full control from their own app, while young people build real-world money skills at their own pace.',
    },
    {
      q: 'How does the prepaid card work?',
      a: 'Every child gets their own Masroofi Visa debit card, issued in partnership with Arab Bank. Parents top it up instantly from the app, and kids can only spend what has been loaded — no overdrafts, ever.',
    },
    {
      q: 'Can I control where my child spends?',
      a: 'Yes. You can set spending limits, block or allow specific store categories, freeze the card in one tap, and get a real-time notification for every purchase.',
    },
    {
      q: 'How do kids earn money on Masroofi?',
      a: 'Parents can set up chores and tasks with rewards. When a task is marked complete, the reward is paid straight to the child’s balance — turning everyday jobs into a lesson in earning.',
    },
    {
      q: 'What are Money Missions?',
      a: 'Money Missions are bite-sized, interactive lessons that teach kids how money works — saving, budgeting, spending wisely and giving — with points and rewards along the way.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes — start with a 30-day free trial. No commitment, and you can cancel anytime before it ends at no cost.',
    },
  ];
}
