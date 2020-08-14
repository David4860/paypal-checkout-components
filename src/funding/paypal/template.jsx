/* @flow */
/** @jsx node */

import { node, Fragment, Style, type ChildType } from 'jsx-pragmatic/src';
import { PPLogo, PayPalLogo, CreditLogo, CreditMark, PayPalMark, GlyphCard, GlyphBank, LOGO_CLASS } from '@paypal/sdk-logos/src';
import { FUNDING, WALLET_INSTRUMENT } from '@paypal/sdk-constants/src';

import { type LogoOptions, type LabelOptions, type WalletLabelOptions, type TagOptions, BasicLabel } from '../common';
import { CLASS, ATTRIBUTE, BUTTON_LAYOUT } from '../../constants';
import { componentContent } from '../content';
import { Text, Space } from '../../ui/text';
import { TrackingBeacon } from '../../ui/tracking';
import { HIDDEN, VISIBLE, COMPRESSED, EXPANDED } from '../../ui/buttons/styles/labels';

import css from './style.scoped.scss';

export function Logo({ logoColor } : LogoOptions) : ChildType {
    return (
        <Fragment>
            <PPLogo logoColor={ logoColor } />
            <Space />
            <PayPalLogo logoColor={ logoColor } />
        </Fragment>
    );
}

function getPersonalizationText({ personalization, layout, multiple } : LabelOptions) : ?string {
    const personalizationText = personalization && personalization.buttonText && personalization.buttonText.text;

    if (!personalizationText) {
        return;
    }

    if (personalizationText.match(/[{}]/)) {
        return;
    }

    if (layout === BUTTON_LAYOUT.HORIZONTAL && multiple) {
        return;
    }

    return personalizationText;
}

function getPersonalizationTracker({ personalization } : LabelOptions) : ?string {
    const personalizationTracker = personalization && personalization.buttonText && personalization.buttonText.tracking && personalization.buttonText.tracking.impression;

    if (!personalizationTracker) {
        return;
    }

    return personalizationTracker;
}

function getButtonPersonalizationStyle(opts : LabelOptions) : ?ChildType {
    if (__TEST__) {
        return null;
    }
    
    const { tagline } = opts;

    const personalizationText = !tagline && getPersonalizationText(opts);

    const MIN_WIDTH = 300;
    const PERSONALIZATION_DURATION = 5;

    const PAYPAL_BUTTON = `.${ CLASS.BUTTON }[${ ATTRIBUTE.FUNDING_SOURCE }=${ FUNDING.PAYPAL }]`;

    return (
        <style innerHTML={ `
            @media only screen and (max-width: ${ MIN_WIDTH }px) {
                .${ CLASS.DOM_READY } ${ PAYPAL_BUTTON } .${ CLASS.PERSONALIZATION_TEXT } {
                    ${ HIDDEN }
                }
            }

            @media only screen and (min-width: ${ MIN_WIDTH }px) {
                .${ CLASS.DOM_READY } ${ PAYPAL_BUTTON } .${ LOGO_CLASS.LOGO }.${ LOGO_CLASS.LOGO }-${ FUNDING.PAYPAL } {
                    animation: ${ personalizationText ? `toggle-paypal-logo ${ PERSONALIZATION_DURATION }s 0s forwards` : `none` };
                }

                .${ CLASS.DOM_READY } ${ PAYPAL_BUTTON } .${ CLASS.TEXT }:not(.${ CLASS.PERSONALIZATION_TEXT }):not(.${ CLASS.HIDDEN }) {
                    ${ COMPRESSED }
                    ${ VISIBLE }
                    animation: ${ personalizationText ? `show-text-delayed ${ PERSONALIZATION_DURATION }s 0s forwards` : `show-text 1s 0s forwards` };
                }

                .${ CLASS.DOM_READY } ${ PAYPAL_BUTTON } .${ CLASS.PERSONALIZATION_TEXT } {
                    ${ COMPRESSED }
                    ${ VISIBLE }
                    animation: show-personalization-text ${ PERSONALIZATION_DURATION }s 0s forwards;
                }
            }

            @keyframes toggle-paypal-logo {
                0% { ${ EXPANDED } }
                15% { ${ COMPRESSED } }
                85% { ${ COMPRESSED } }
                100% { ${ EXPANDED } }
            }

            @keyframes show-text-delayed {
                0% { ${ COMPRESSED } }
                85% { ${ COMPRESSED } }
                100% { ${ EXPANDED } }
            }

            @keyframes show-personalization-text {
                0% { ${ COMPRESSED } }
                15% { ${ COMPRESSED } }
                25% { ${ EXPANDED } }
                70% { ${ EXPANDED } }
                85% { ${ COMPRESSED } }
                100% { ${ COMPRESSED } }
            }
        ` } />
    );
}

function ButtonPersonalization(opts : LabelOptions) : ?ChildType {
    if (__WEB__) {
        return;
    }

    const { nonce, tagline, label } = opts;
    
    if (tagline || !label) {
        return;
    }

    const personalizationText = getPersonalizationText(opts);
    const personalizationTracker = getPersonalizationTracker(opts);

    if (!personalizationText) {
        return;
    }

    return (
        <Fragment>
            <Text className={ CLASS.PERSONALIZATION_TEXT } optional={ 2 }>{ personalizationText }</Text>
            {
                personalizationTracker &&
                    <TrackingBeacon url={ personalizationTracker } nonce={ nonce } />
            }
            {
                getButtonPersonalizationStyle(opts)
            }
        </Fragment>
        
    );
}


export function Label(opts : LabelOptions) : ChildType {
    return (
        <Fragment>
            <BasicLabel { ...opts } />
            <ButtonPersonalization { ...opts } />
        </Fragment>
    );
}

export function WalletLabelNew({ logoColor, instrument, content, commit } : WalletLabelOptions) : ?ChildType {
    if (__WEB__) {
        return;
    }

    let logo;
    let label;

    if (instrument.type === WALLET_INSTRUMENT.CARD && instrument.label) {
        logo = instrument.logoUrl
            ? <img class='card-art' src={ instrument.logoUrl } />
            : <GlyphCard logoColor={ logoColor } />;

        label = instrument.label.replace('••••', '••');

    } else if (instrument.type === WALLET_INSTRUMENT.BANK && instrument.label) {
        logo = instrument.logoUrl
            ? <img class='card-art' src={ instrument.logoUrl } />
            : <GlyphBank logoColor={ logoColor } />;

        label = instrument.label.replace('••••', '••');

    } else if (instrument.type === WALLET_INSTRUMENT.CREDIT) {
        logo = <CreditMark />;

        label = content && content.credit;
        
    } else if (instrument.type === WALLET_INSTRUMENT.BALANCE) {
        logo = <PayPalMark />;

        label = content && content.balance;
    } else {
        return;
    }

    return (
        <Style css={ css }>
            <div class='wallet-label-new'>
                <div class='paypal-mark'>
                    <PPLogo logoColor={ logoColor } />
                    <Space />
                </div>
                {
                    content && (
                        <div class='pay-label' optional={ 2 }>
                            <Space />
                            <Text>{ (instrument.oneClick && commit) ? content.payNow : content.payWith }</Text>
                            <Space />
                        </div>
                    )
                }
                {
                    logo &&
                        <div class='logo' optional={ 1 }>
                            { logo }
                        </div>
                }
                {
                    label &&
                        <div class='label'>
                            <Space />
                            <Text>{ label }</Text>
                        </div>
                }
            </div>
        </Style>
    );
}

export function WalletLabel(opts : WalletLabelOptions) : ?ChildType {
    const { logoColor, instrument, locale, content, commit, experiment } = opts;

    if (__WEB__) {
        return;
    }

    if (experiment.newWalletDesign) {
        return WalletLabelNew(opts);
    }

    let logo;

    if (instrument.logoUrl) {
        logo = <img class='card-art' src={ instrument.logoUrl } />;
    } else if (instrument.type === WALLET_INSTRUMENT.CARD) {
        logo = <GlyphCard logoColor={ logoColor } />;
    } else if (instrument.type === WALLET_INSTRUMENT.BANK) {
        logo = <GlyphBank logoColor={ logoColor } />;
    } else if (instrument.type === WALLET_INSTRUMENT.CREDIT) {
        logo = <CreditLogo locale={ locale } logoColor={ logoColor } />;
    }

    return (
        <Style css={ css }>
            <div class='wallet-label'>
                <div class='paypal-mark'>
                    <PPLogo logoColor={ logoColor } />
                </div>
                {
                    (instrument.oneClick && commit && content) &&
                        <div class='pay-label'>
                            <Space />
                            <Text>{ content.payNow }</Text>
                        </div>
                }
                <div class='paypal-wordmark'>
                    <Space />
                    <PayPalLogo logoColor={ logoColor } />
                </div>
                <div class='divider'>|</div>
                {
                    logo &&
                        <div class='logo' optional>
                            { logo }
                            <Space />
                        </div>
                }
                <div class='label'>
                    <Text className={ [ 'limit' ] }>
                        { instrument.label }
                    </Text>
                </div>
            </div>
        </Style>
    );
}

export function Tag({ multiple, locale: { lang } } : TagOptions) : ?ChildType {
    if (__WEB__) {
        return null;
    }
    
    const { DualTag, SaferTag } = componentContent[lang];

    return (multiple && DualTag)
        ? <DualTag optional />
        : <SaferTag optional />;
}
