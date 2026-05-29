import { City, Country, State } from 'country-state-city';
import isEmail from 'validator/lib/isEmail';
import isPostalCode from 'validator/lib/isPostalCode';

export type CountryOption = {
  code: string;
  name: string;
};

export type StateOption = {
  code: string;
  name: string;
};

export type CityOption = {
  name: string;
};

export type PhoneCodeOption = {
  iso: string;
  name: string;
  dialCode: string;
};

export function getCountryOptions(): CountryOption[] {
  return Country.getAllCountries().map((country) => ({
    code: country.isoCode,
    name: country.name,
  }));
}

export function getPhoneCodeOptions(): PhoneCodeOption[] {
  return Country.getAllCountries()
    .filter((country) => Boolean(country.phonecode))
    .map((country) => ({
      iso: country.isoCode,
      name: country.name,
      dialCode: `+${country.phonecode.replace(/^\+/, '')}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getStateOptions(countryCode: string): StateOption[] {
  if (!countryCode) {
    return [];
  }

  return State.getStatesOfCountry(countryCode).map((state) => ({
    code: state.isoCode,
    name: state.name,
  }));
}

export function getCityOptions(countryCode: string, stateCode: string): CityOption[] {
  if (!countryCode || !stateCode) {
    return [];
  }

  return City.getCitiesOfState(countryCode, stateCode).map((city) => ({
    name: city.name,
  }));
}

export function isValidEmailAddress(value: string): boolean {
  return isEmail(value.trim());
}

function normalizePostalCountryCode(countryCode: string): string {
  const normalizedCode = countryCode.trim().toUpperCase();

  if (normalizedCode === 'UK') {
    return 'GB';
  }

  return normalizedCode;
}

export function validatePostalCode(value: string, countryCode: string): boolean {
  const normalizedValue = value.trim();
  const normalizedCountryCode = normalizePostalCountryCode(countryCode);

  if (!normalizedValue || !normalizedCountryCode) {
    return false;
  }

  try {
    return isPostalCode(normalizedValue, normalizedCountryCode as Parameters<typeof isPostalCode>[1]);
  } catch {
    // validator throws for locales it does not support (e.g. KW); fall back to a generic check.
    return isPostalCode(normalizedValue, 'any');
  }
}

export function isValidPostalCode(value: string, countryCode?: string): boolean {
  if (countryCode && countryCode.trim()) {
    return validatePostalCode(value, countryCode);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return false;
  }

  return isPostalCode(normalizedValue, 'any');
}

export function normalizeCountryCode(value: string): string {
  const rawValue = value.trim();

  if (!rawValue) {
    return '';
  }

  const uppercaseValue = rawValue.toUpperCase();
  const matchedByCode = Country.getCountryByCode(uppercaseValue);

  if (matchedByCode) {
    return matchedByCode.isoCode;
  }

  const matchedByName = Country.getAllCountries().find(
    (country) => country.name.toLowerCase() === rawValue.toLowerCase(),
  );

  return matchedByName?.isoCode ?? rawValue;
}

export function normalizeStateCode(countryCode: string, value: string): string {
  const rawValue = value.trim();

  if (!rawValue || !countryCode) {
    return rawValue;
  }

  const states = State.getStatesOfCountry(countryCode);
  const uppercaseValue = rawValue.toUpperCase();
  const matchedByCode = states.find((state) => state.isoCode.toUpperCase() === uppercaseValue);

  if (matchedByCode) {
    return matchedByCode.isoCode;
  }

  const matchedByName = states.find((state) => state.name.toLowerCase() === rawValue.toLowerCase());

  return matchedByName?.isoCode ?? rawValue;
}

export function getCountryName(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();

  if (!code) {
    return '';
  }

  return Country.getCountryByCode(code)?.name ?? countryCode;
}

export function getStateName(countryCode: string, stateCode: string): string {
  const country = countryCode.trim().toUpperCase();
  const state = stateCode.trim().toUpperCase();

  if (!country || !state) {
    return stateCode;
  }

  const foundState = State.getStateByCodeAndCountry(state, country);

  return foundState?.name ?? stateCode;
}
