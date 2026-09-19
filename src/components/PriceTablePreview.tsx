import React, { forwardRef } from 'react';
import { PriceListDocument } from '../types';
import { COLOR_THEMES } from '../data/defaults';
import { formatPriceString, toPersianDigits } from '../utils/formatters';
import { Phone, MapPin, Globe, Instagram, Send, Sparkles } from 'lucide-react';

interface PriceTablePreviewProps {
  document: PriceListDocument;
  scale?: number;
}

export const PriceTablePreview = forwardRef<HTMLDivElement, PriceTablePreviewProps>(
  ({ document, scale = 1 }, ref) => {
    const { title, subtitle, date, banner, items, footerNote, contact, settings } = document;
    const theme = COLOR_THEMES.find((t) => t.id === settings.themeId) || COLOR_THEMES[0];

    const fontSizeClasses = {
      sm: { title: 'text-lg', subtitle: 'text-xs', header: 'text-xs', body: 'text-xs', price: 'text-xs' },
      base: { title: 'text-xl', subtitle: 'text-sm', header: 'text-sm', body: 'text-sm', price: 'text-sm' },
      lg: { title: 'text-2xl', subtitle: 'text-base', header: 'text-base', body: 'text-base', price: 'text-base font-semibold' },
      xl: { title: 'text-3xl', subtitle: 'text-lg', header: 'text-lg', body: 'text-lg', price: 'text-lg font-bold' },
    }[settings.fontSize];

    const paddingClasses = {
      compact: 'py-1 px-2.5',
      normal: 'py-2 px-3.5',
      spacious: 'py-3 px-4',
    }[settings.rowDensity];

    const formatNum = (val: string | number) => {
      return settings.usePersianNumbers ? toPersianDigits(val) : String(val);
    };

    return (
      <div
        ref={ref}
        id="price-sheet-render-target"
        className="price-sheet-container bg-white text-gray-900 overflow-hidden shadow-2xl relative select-none"
        style={{
          width: `${settings.cardWidth}px`,
          minWidth: `${settings.cardWidth}px`,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          border: `1px solid ${theme.borderColor}`,
        }}
      >
        {/* Top Header Banner (Inspired by the sample design with angled orange bars and dark brand plate) */}
        <div className="relative w-full overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
          {/* Top accent orange line */}
          <div className="h-1.5 w-full" style={{ backgroundColor: theme.primary }} />

          {/* Main Top Banner container */}
          <div className="relative flex items-center justify-between px-4 py-2.5 my-1">
            {/* Left geometric styling stripes (like sample) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="h-9 w-6 transform -skew-x-12 rounded-sm"
                style={{ backgroundColor: theme.primary }}
              />
              <div
                className="h-9 w-2 transform -skew-x-12 rounded-sm opacity-80"
                style={{ backgroundColor: theme.primary }}
              />
              {banner.logoUrl && banner.logoType === 'image' && (
                <img
                  src={banner.logoUrl}
                  alt="Logo"
                  className="h-10 max-w-[90px] object-contain ml-2 rounded"
                />
              )}
            </div>

            {/* Center / Right Brand Title Box */}
            <div
              className="flex-1 mx-3 px-6 py-1.5 rounded-sm flex items-center justify-center shadow-inner relative overflow-hidden"
              style={{ backgroundColor: theme.primaryDark }}
            >
              {/* Subtle angular shine effect */}
              <div
                className="absolute inset-y-0 right-0 w-8 transform skew-x-12 opacity-20"
                style={{ backgroundColor: theme.primary }}
              />
              <div className="text-center">
                <span
                  className="text-white font-extrabold tracking-widest text-2xl md:text-3xl font-sans inline-block drop-shadow"
                  style={{ fontFamily: "'Plus Jakarta Sans', 'Vazirmatn', sans-serif" }}
                >
                  {banner.brandName || 'BRAND'}
                </span>
                {banner.brandSubtext && (
                  <p className="text-gray-300 text-[10px] tracking-normal font-normal mt-0.5">
                    {banner.brandSubtext}
                  </p>
                )}
              </div>
            </div>

            {/* Right geometric styling stripes */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="h-9 w-2 transform -skew-x-12 rounded-sm opacity-80"
                style={{ backgroundColor: theme.primary }}
              />
              <div
                className="h-9 w-6 transform -skew-x-12 rounded-sm"
                style={{ backgroundColor: theme.primary }}
              />
            </div>
          </div>

          {/* Bottom accent orange line */}
          <div className="h-1.5 w-full" style={{ backgroundColor: theme.primary }} />
        </div>

        {/* Sheet Sub-Header: Store / Company Title & Optional Date */}
        <div className="px-6 pt-3 pb-2 text-center">
          <h1
            className={`font-black text-gray-900 tracking-tight ${fontSizeClasses.title}`}
            style={{ color: theme.primaryText }}
          >
            {title}
          </h1>
          <div className="flex items-center justify-center gap-4 mt-1 text-gray-600">
            {subtitle && <p className={`font-medium ${fontSizeClasses.subtitle}`}>{subtitle}</p>}
            {date && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200 font-mono">
                تاریخ: {formatNum(date)}
              </span>
            )}
          </div>
        </div>

        {/* Main Price Table */}
        <div className="px-4 pb-2">
          <div
            className="overflow-hidden rounded-xs border"
            style={{ borderColor: theme.borderColor }}
          >
            <table className="price-sheet-table w-full text-right border-collapse">
              {/* Table Header */}
              <thead>
                <tr
                  className="font-bold text-gray-900 select-none"
                  style={{
                    backgroundColor: theme.primaryLight,
                    borderBottom: `2px solid ${theme.primary}`,
                  }}
                >
                  {settings.showRowNumber && (
                    <th
                      className={`text-center font-bold border-l w-12 ${paddingClasses} ${fontSizeClasses.header}`}
                      style={{ borderColor: theme.borderColor }}
                    >
                      ردیف
                    </th>
                  )}
                  {settings.showCodeColumn && (
                    <th
                      className={`text-center font-bold border-l w-20 ${paddingClasses} ${fontSizeClasses.header}`}
                      style={{ borderColor: theme.borderColor }}
                    >
                      کد کالا
                    </th>
                  )}
                  <th
                    className={`font-black text-center ${paddingClasses} ${fontSizeClasses.header}`}
                    style={{ borderColor: theme.borderColor }}
                  >
                    <span className="tracking-wide inline-block">عـــــنـــــوان</span>
                  </th>
                  {settings.showUnitColumn && (
                    <th
                      className={`text-center font-bold border-r w-16 ${paddingClasses} ${fontSizeClasses.header}`}
                      style={{ borderColor: theme.borderColor }}
                    >
                      واحد
                    </th>
                  )}
                  {settings.showDiscountColumn && (
                    <th
                      className={`text-center font-bold border-r w-20 ${paddingClasses} ${fontSizeClasses.header}`}
                      style={{ borderColor: theme.borderColor }}
                    >
                      تخفیف
                    </th>
                  )}
                  <th
                    className={`text-center font-black border-r w-32 ${paddingClasses} ${fontSizeClasses.header}`}
                    style={{ borderColor: theme.borderColor }}
                  >
                    <span>قیمت</span>
                    {settings.currencyPosition === 'in_header' && settings.currency && (
                      <span className="text-[11px] font-normal text-gray-700 mr-1">
                        ({settings.currency})
                      </span>
                    )}
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y" style={{ borderColor: theme.borderColor }}>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-gray-400 font-medium text-sm"
                    >
                      هیچ کالایی در لیست وجود ندارد
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => {
                    const isEven = index % 2 === 1;
                    const rowBg = item.isHighlighted
                      ? '#fef08a' // Highlighted yellow
                      : isEven
                      ? theme.rowAltBg
                      : '#ffffff';

                    return (
                      <tr
                        key={item.id}
                        style={{
                          backgroundColor: rowBg,
                          borderBottom: `1px solid ${theme.borderColor}`,
                        }}
                        className="transition-colors"
                      >
                        {/* Row number */}
                        {settings.showRowNumber && (
                          <td
                            className={`text-center text-gray-600 font-mono border-l ${paddingClasses} ${fontSizeClasses.body}`}
                            style={{ borderColor: theme.borderColor }}
                          >
                            {formatNum(index + 1)}
                          </td>
                        )}

                        {/* Code Column */}
                        {settings.showCodeColumn && (
                          <td
                            className={`text-center text-gray-500 font-mono text-xs border-l ${paddingClasses}`}
                            style={{ borderColor: theme.borderColor }}
                          >
                            {item.code ? formatNum(item.code) : '-'}
                          </td>
                        )}

                        {/* Item Title */}
                        <td
                          className={`font-semibold text-gray-900 text-center ${paddingClasses} ${fontSizeClasses.body}`}
                          style={{ borderColor: theme.borderColor }}
                        >
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <span>{item.title}</span>
                            {item.badge && (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded shadow-xs text-white"
                                style={{ backgroundColor: theme.accentBadge }}
                              >
                                {item.badge.includes('💥') || item.badge.includes('ویژه') ? (
                                  <Sparkles className="w-2.5 h-2.5" />
                                ) : null}
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Unit Column */}
                        {settings.showUnitColumn && (
                          <td
                            className={`text-center text-gray-600 border-r ${paddingClasses} ${fontSizeClasses.body}`}
                            style={{ borderColor: theme.borderColor }}
                          >
                            {item.unit || '-'}
                          </td>
                        )}

                        {/* Discount Column */}
                        {settings.showDiscountColumn && (
                          <td
                            className={`text-center text-red-600 font-bold border-r ${paddingClasses} ${fontSizeClasses.body}`}
                            style={{ borderColor: theme.borderColor }}
                          >
                            {item.discount ? formatNum(item.discount) : '-'}
                          </td>
                        )}

                        {/* Price Column */}
                        <td
                          className={`text-center font-bold text-gray-950 font-mono border-r ${paddingClasses} ${fontSizeClasses.price}`}
                          style={{ borderColor: theme.borderColor }}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>
                              {formatPriceString(item.price, settings.usePersianNumbers)}
                            </span>
                            {settings.currencyPosition === 'in_cell' &&
                              item.price !== '-' &&
                              settings.currency && (
                                <span className="text-[10px] text-gray-600 font-normal mr-0.5">
                                  {settings.currency}
                                </span>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        {footerNote && (
          <div className="px-4 py-1.5 text-center">
            <p className="text-xs font-semibold text-gray-700 tracking-tight">{footerNote}</p>
          </div>
        )}

        {/* Bottom Footer Banner (with Phone, Address, Socials & Matching Geometric Design) */}
        <div className="relative w-full overflow-hidden bg-white mt-1">
          {/* Top accent orange line */}
          <div className="h-1 w-full" style={{ backgroundColor: theme.primary }} />

          {/* Contact Details Grid */}
          <div
            className="px-4 py-2 text-white text-xs"
            style={{ backgroundColor: theme.primaryDark }}
          >
            <div className="flex flex-wrap items-center justify-between gap-y-1.5 text-[11px] md:text-xs">
              {/* Phone Numbers */}
              {(contact.phone1 || contact.phone2) && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold">تلفن:</span>
                  <span className="font-mono font-bold" dir="ltr">
                    {contact.phone1 ? formatNum(contact.phone1) : ''}
                    {contact.phone1 && contact.phone2 ? ' - ' : ''}
                    {contact.phone2 ? formatNum(contact.phone2) : ''}
                  </span>
                </div>
              )}

              {/* Socials / Telegram / Instagram */}
              <div className="flex items-center gap-3">
                {contact.instagram && (
                  <div className="flex items-center gap-1 font-mono text-[11px]" dir="ltr">
                    <Instagram className="w-3 h-3 text-pink-400" />
                    <span>{contact.instagram}</span>
                  </div>
                )}
                {contact.telegram && (
                  <div className="flex items-center gap-1 font-mono text-[11px]" dir="ltr">
                    <Send className="w-3 h-3 text-sky-400" />
                    <span>{contact.telegram}</span>
                  </div>
                )}
                {contact.website && (
                  <div className="flex items-center gap-1 font-mono text-[11px]" dir="ltr">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span>{contact.website}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {contact.address && (
              <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-gray-600/60 text-[11px] text-gray-200">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="font-semibold text-gray-300">آدرس:</span>
                <span>{contact.address}</span>
              </div>
            )}
          </div>

          {/* Bottom Brand Bar (Matching the sample image with Emee te style) */}
          <div
            className="relative flex items-center justify-between px-4 py-1.5"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div className="flex items-center gap-1 shrink-0">
              <div
                className="h-6 w-4 transform -skew-x-12 rounded-xs"
                style={{ backgroundColor: theme.primary }}
              />
              <div
                className="h-6 w-1.5 transform -skew-x-12 rounded-xs opacity-75"
                style={{ backgroundColor: theme.primary }}
              />
            </div>

            <div
              className="flex-1 mx-3 py-0.5 px-4 rounded-xs text-center shadow-xs"
              style={{ backgroundColor: theme.primaryDark }}
            >
              <span
                className="text-white font-extrabold tracking-widest text-base md:text-lg font-sans"
                style={{ fontFamily: "'Plus Jakarta Sans', 'Vazirmatn', sans-serif" }}
              >
                {banner.brandName || 'BRAND'}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <div
                className="h-6 w-1.5 transform -skew-x-12 rounded-xs opacity-75"
                style={{ backgroundColor: theme.primary }}
              />
              <div
                className="h-6 w-4 transform -skew-x-12 rounded-xs"
                style={{ backgroundColor: theme.primary }}
              />
            </div>
          </div>

          {/* Bottom-most accent stripe */}
          <div className="h-1 w-full" style={{ backgroundColor: theme.primary }} />
        </div>
      </div>
    );
  }
);

PriceTablePreview.displayName = 'PriceTablePreview';
